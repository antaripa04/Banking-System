
exports.getDate = function () {
  const today = new Date();
  var ampm = today.getHours() >= 12 ? "PM" : "AM";
  var datetime =
    today.getDate() +
    "/" +
    (today.getMonth() + 1) +
    "/" +
    today.getFullYear() +
    " @ " +
    today.getHours() +
    ":" +
    today.getMinutes() +
    ":" +
    today.getSeconds() +
    " " +
    ampm;
  return datetime;
};
















// exports.getDay = function () {
//   const today = new Date();
//   const options = {
//     weekday: "long"
//   };
//   return today.toLocaleDateString("en-US", options);
// };
