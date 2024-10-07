const transformDate = (isoDate) => {
  const date = new Date(isoDate);

  const addLeadingZero = (num) => (num < 10 ? `0${num}` : num);

  const day = addLeadingZero(date.getDate());
  const month = addLeadingZero(date.getMonth() + 1);
  const year = date.getFullYear().toString().slice(-2);
  let hours = date.getHours();
  const minutes = addLeadingZero(date.getMinutes());

  const amPm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;

  return `${day}-${month}-${year} (${addLeadingZero(hours)}:${minutes} ${amPm})`;
};

export default transformDate;
