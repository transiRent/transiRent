document.addEventListener(
  "DOMContentLoaded",
  () => {
    console.log("transiRent JS imported successfully!");
  },
  false
);

document.querySelector('#add').onclick = () => {
  const start = document.querySelector('#start').value;
  const end = document.querySelector('#end').value;
  let startYear = +start.split('T')[0].split('-')[0];
  let startMonth = +start.split('T')[0].split('-')[1];
  let startDay = +start.split('T')[0].split('-')[2];
  let startHour = +start.split('T')[1].split(':')[0];
  let endYear = +start.split('T')[0].split('-')[0];
  let endMonth = +end.split('T')[0].split('-')[1];
  let endDay = +end.split('T')[0].split('-')[2];
  let endHour = +end.split('T')[1].split(':')[0];
  for (let year = startYear; year <= endYear; year++) {
    for (let month = startMonth; month <= endMonth; month++) {
      for (let day = startDay; day <= endDay; day++) {
        for (let hour = startHour; hour <= endHour; hour++) {
          document.querySelector('#timeslots').insertAdjacentHTML('beforeend', `<option value="${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}T${hour.toString().padStart(2, "0")}:00" selected>${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}T${hour.toString().padStart(2, "0")}:00</option>`);
        }
      }
    }
  }
}