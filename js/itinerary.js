
function esc(s) {
  return String(s || "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[c]));
}

const root = document.getElementById("timeline");
root.innerHTML = window.TRIP_ITINERARY.map(d => `
  <article class="day-card">
    <div class="day-head">
      <strong>Day ${esc(d.day)}</strong>
      <span>${esc(d.date)}</span>
    </div>
    <div class="day-body">
      <section class="day-cell"><h4>Morning</h4>${esc(d.morning)}</section>
      <section class="day-cell"><h4>Afternoon</h4>${esc(d.afternoon)}</section>
      <section class="day-cell"><h4>Evening</h4>${esc(d.evening)}</section>
      <section class="day-cell"><h4>Hotel / Notes</h4><strong>${esc(d.hotel)}</strong><br><br>${esc(d.notes)}</section>
    </div>
  </article>
`).join("");
