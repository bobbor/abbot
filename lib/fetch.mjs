import { URL } from "url";
import { get } from "https";
import { Observable, asapScheduler } from "rxjs";

const mkUrl = ({ user, token, job, build, instance }) => {
  const auth = Buffer.from(`${user}:${token}`).toString("base64");

  const jobPath = job
    .split(">")
    .map((item) => `/job/${encodeURIComponent(item.trim())}`)
    .join("");
  const myUrl = new URL(instance);
  myUrl.pathname = `${jobPath}/${build}/api/json`;
  myUrl.searchParams.append(
    "tree",
    "result,estimatedDuration,duration,building,fullDisplayName,url,timestamp"
  );

  return {
    url: myUrl.toString(),
    headers: {
      Authorization: `Basic ${auth}`,
    },
  };
};
const reachableUrl = (_url) => {
  const url = new URL(_url);
  url.searchParams.delete("tree");
  url.pathname = url.pathname.replace(/\/api\/json$/gi, "");
  return url.toString();
};
const fetch = ({ url, headers }, fn) => {
  let out = "";
  const req = get(url, { headers }, (res) => {
    if (res.statusCode >= 400) {
      if (res.statusCode === 404) {
        return fn({
          message: "[404] job not found",
          details: reachableUrl(url),
        });
      }
      return fn({
        message: `[${res.statusCode}] request error`,
        details: url,
      });
    }
    res.on("data", (b) => {
      out += b;
    });
    res.on("end", () => {
      fn(null, JSON.parse(out));
    });
  });
  req.on("error", (err) => {
    fn(err);
  });
};
const format = (job) => ({
  url: job.url,
  name: job.fullDisplayName,
  result: job.result ? job.result.toLowerCase() : job.result,
  building: job.building,
  estimatedDuration: job.estimatedDuration,
  state: job.building ? "building" : "finished",
  timestamp: job.timestamp,
  duration: job.duration,
});
export default ({ instance, user, token, job, build }) => {
  const url = mkUrl({ user, token, job, build, instance });
  return new Observable(($observer) => {
    function fn() {
      const that = this;
      fetch(url, (err, data) => {
        if (err) {
          $observer.error(err);
          return;
        }
        $observer.next(format(data));
        if (data.building) {
          that.schedule(data, 1000 * 15);
        } else {
          $observer.complete();
        }
      });
    }

    asapScheduler.schedule(fn);
  });
};
