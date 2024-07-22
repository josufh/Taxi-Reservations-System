import { initializeApp } from "firebase/app";
import { collection, addDoc, getFirestore, Timestamp, onSnapshot, query, where } from "firebase/firestore";
import { firebaseConfig } from "./env.js"

let curr_open_div = "show-reservations-div"

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const res_col_ref = collection(db, "reservations")

window.onload = () => {
  getReservations()
  document.getElementById("yoyaku-kakutei-button").onclick = confirmReservation;
  document.getElementById("new-reservation-button").onclick = () => toggleWindow("new-reservation-div", "flex")
  document.getElementById("show-reservations-button").onclick = () => {
    toggleWindow("show-reservations-div", "block")
    getReservations()
  }
};

function confirmReservation() {
  const guest_name = document.getElementById("input-name").value
  if (guest_name == "") {
    fireError("お客様のお名前を記入してください")
    return
  }

  const guest_room = document.getElementById("input-room").value
  const guest_phone = document.getElementById("input-phone").value
  if (guest_room == "" && guest_phone == "") {
    fireError("お部屋番号かご連絡先を記入してください")
    return
  }

  const reservation_date = document.getElementById("input-day").value
  if (reservation_date == "") {
    fireError("ご乗車日を選択してください")
    return
  }
  const timestamp_date = getTimestamp(reservation_date)
  
  const destination = document.getElementById("input-destination").value
  if (destination == "") {
    fireError("降車住所を記入してください")
    return
  }

  const car_type = document.getElementById("input-type").value
  const car_number = document.getElementById("input-number").value
  const people_number = document.getElementById("input-people").value
  const bags = document.getElementById("input-bags").value
  const estimate = document.getElementById("input-estimate").value
  const remarks = document.getElementById("input-remarks").value
  
  const company = document.getElementById("input-company").value
  const company_phone = document.getElementById("input-company-phone").value
  const tanto = document.getElementById("input-tanto").value
  const senpo = document.getElementById("input-senpo").value

  const data = {
    guest_name: guest_name,
    guest_room: guest_room,
    guest_phone: guest_phone,
    timestamp_date: timestamp_date,
    destination: destination,
    car_type: car_type,
    car_number: car_number,
    people_number: people_number,
    bags: bags,
    estimate: estimate,
    remarks: remarks,
    company: company,
    company_phone: company_phone,
    tanto: tanto,
    senpo: senpo
  }

  addDoc(res_col_ref, data)
    .then(() => console.log("Reservation added successfully!"))
}

function fireError(error_string) {
  document.getElementById("error-window-div").style.display = "flex"
  document.getElementById("error-message").innerHTML = error_string
  setTimeout(clearError, 2000)
}

function clearError() {
  document.getElementById("error-window-div").style.display = "none"
}

function getTimestamp(date_string) {
  return Timestamp.fromDate(new Date(date_string))
}

function getDate(date_timestamp) {
  return date_timestamp.toDate()
}

function toggleWindow(divId, mode) {
  if (curr_open_div != "") {
    document.getElementById(curr_open_div).style.display = "none"
  }
  document.getElementById(divId).style.display = mode
  curr_open_div = divId
}

function getReservations() {
  const q = query(res_col_ref, where("timestamp_date", ">=", Timestamp.now()))
  onSnapshot(q, querySnapshot => {
    writeTable(querySnapshot)
  })
}

function writeTable(snapshot) {
  let reservations = []
  snapshot.forEach(doc => {
    reservations.push({...doc.data(), id: doc.id, ref: doc.ref})
  })
  reservations.sort((a, b) => sortBy(a, b, "timestamp_date"))

  const table = document.getElementById("show-table")
  table.innerHTML = "<tr><th>ご乗車日</th><th>お名前</th><th>降車住所</th><th>台数</th><th>人数</th><th>タクシー会社</th></tr>"
  reservations.forEach(reservation => {
    let tr = document.createElement("tr")
    tr.id = reservation.id
    tr.className += "show-table-row"

    let td_datetime = document.createElement("td")
    let date1 = getDate(reservation.timestamp_date).toLocaleString("jp-JA", { hour12: false })
    let date2 = date1.split(", ")
    let datel = date2[0].split("/")
    let dater = date2[1].split(":")
    td_datetime. innerHTML = datel[0] + "/" + datel[1] + " " + dater[0] + ":" + dater[1]
    tr.appendChild(td_datetime)

    let td_name = document.createElement("td")
    td_name.innerHTML = reservation.guest_name + "様"
    tr.appendChild(td_name)

    let td_destination = document.createElement("td")
    td_destination.innerHTML = reservation.destination
    tr.appendChild(td_destination)

    let td_carnum = document.createElement("td")
    td_carnum.innerHTML = reservation.car_number
    tr.appendChild(td_carnum)

    let td_people = document.createElement("td")
    td_people.innerHTML = reservation.people_number
    tr.appendChild(td_people)

    let td_company = document.createElement("td")
    td_company.innerHTML = reservation.company
    tr.appendChild(td_company)

    table.appendChild(tr)
  })
}

function sortBy(a, b, constraint) {
  let fa = a[constraint], fb = b[constraint]
  if (fa < fb) return -1
  if (fa > fb) return 1
  return 0
}