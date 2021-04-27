document.addEventListener(
  "DOMContentLoaded",
  () => {
    console.log("transiRent JS imported successfully!");
  },
  false
);

document.querySelector('#add').onclick = () => {
  const startDate = new Date(document.querySelector('#start').value);
  const endDate = new Date(document.querySelector('#end').value);
  const times = [];
  if (startDate < endDate) {
    do {
      times.push({ day: `${startDate.getFullYear()}-${startDate.getMonth()+1}-${startDate.getDate()}`, hour: `${startDate.getHours()}`, time: `${startDate.toISOString()}` })
      startDate.setTime(startDate.getTime() + 3600000);
    } while (startDate < endDate)
  }
  const dates = new Set(times.map(time => time.day));
  let output = '';
  for (date of dates) {
    output += `<div><h4>${date}</h4>`;
    for (time of times) {
      if (time.day === date) {
        output += `<input type="checkbox" class="btn-check" name="times" id="${time.time}" value="${time.time}" checked="true" autocomplete="off">
                  <label class="btn btn-outline-primary" for="${time.time}">${time.hour}:00</label>`
      }
    }
    output += `</div>`;
  }
  document.querySelector('#dates').innerHTML = output;
}