import { initializeApp } from "firebase/app";
import { collection, addDoc, getFirestore, Timestamp, onSnapshot, query, where } from "firebase/firestore";
import { firebaseConfig } from "./env.js"

let curr_open_div = "show-reservations-div"

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const res_col_ref = collection(db, "reservations")

let details_row = -1
let details_id = ""
let reservations = []

window.onload = () => {
  getReservations()
  document.getElementById("new-reservation-confirm").onclick = confirmReservation;
  document.getElementById("new-reservation-button").onclick = () => toggleWindow("new-reservation-div", "block")
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
    .then(() => {
      console.log("Reservation added successfully!")
      toggleWindow("show-reservations-div", "block")
    })
}

function fireError(error_string) {
  document.getElementById("error-window-div").style.display = "flex"
  document.getElementById("error-message").innerHTML = error_string
  setTimeout(clearError, 5000)
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
  reservations = []
  snapshot.forEach(doc => {
    reservations.push({...doc.data(), id: doc.id, ref: doc.ref})
  })
  reservations.sort((a, b) => sortBy(a, b, "timestamp_date"))

  const table = document.getElementById("show-table")
  table.innerHTML = "<tr><th id='table-date'>乗車日時</th><th>名前</th><th id='table-dest'>降車住所</th><th class='table-small'>台数</th><th class='table-small'>人数</th><th id='table-comp'>タクシー会社</th></tr>"
  reservations.forEach(reservation => {
    let tr = document.createElement("tr")
    tr.id = reservation.id
    tr.className += "show-table-row"
    tr.onclick = () => showDetails(reservation.id)

    let td_datetime = document.createElement("td")
    let date1 = getDate(reservation.timestamp_date).toLocaleString("jp-JA", { hour12: false })
    let date3 = date1.replace(",", "")
    console.log(date3 + " why aren't you working")
    let date2 = date3.split(" ")
    let datel = date2[0].split("/")
    let dater = date2[1].split(":")
    td_datetime.innerHTML = datel[2] + "年" + datel[0] + "月" + datel[1] + "日　" + dater[0] + ":" + dater[1]
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

function showDetails(reservation_id) {
  const table = document.getElementById("show-table")

  if (details_row != -1) {
    table.deleteRow(details_row)
    if (reservation_id == details_id) {
      details_id = ""
      details_row = -1
      return
    }
  }
  details_id = reservation_id
  const row = document.getElementById(reservation_id)
  const new_row = table.insertRow(row.rowIndex+1)
  details_row = new_row.rowIndex
  const cell = new_row.insertCell(0)
  cell.colSpan = 6
  cell.innerHTML = document.getElementById("details-div").innerHTML
  cell.className = "details"

  let reservation = reservations.find(o => o.id == details_id)

  node("details-name").innerHTML = reservation.guest_name
  node("details-room").innerHTML = reservation.guest_room==""?"　":reservation.guest_room
  node("details-phone").innerHTML = reservation.guest_phone==""?"　":reservation.guest_phone
  let date1 = getDate(reservation.timestamp_date).toLocaleString("jp-JA", { hour12: false })
  let date2 = date1.split(", ")
  let datel = date2[0].split("/")
  let dater = date2[1].split(":")
  node("details-time").innerHTML = datel[2] + "年" + datel[0] + "月" + datel[1] + "日　" + dater[0] + ":" + dater[1]
  node("details-dest").innerHTML = reservation.destination
  node("details-type").innerHTML = reservation.car_type==""?"　":reservation.car_type
  node("details-cars").innerHTML = reservation.car_number==""?"　":reservation.car_number
  node("details-people").innerHTML = reservation.people_number==""?"　":reservation.people_number
  node("details-bags").innerHTML = reservation.bags==""?"　":reservation.bags
  node("details-estimate").innerHTML = reservation.estimate==""?"　":reservation.estimate
  node("details-remarks").innerHTML = reservation.remarks==""?"　":reservation.remarks
  node("details-comp").innerHTML = reservation.company==""?"　":reservation.company
  node("details-senpo").innerHTML = reservation.senpo==""?"　":reservation.senpo
  node("details-compphone").innerHTML = reservation.company_phone==""?"　":reservation.company_phone
  node("details-tanto").innerHTML = reservation.tanto==""?"　":reservation.tanto
  document.getElementById("print-button").href = "print.html?name="+reservation.guest_name+"&room="+reservation.guest_room+"&phone="+reservation.guest_phone
      +"&time="+datel[2] + "年" + datel[0] + "月" + datel[1] + "日　" + dater[0] + ":" + dater[1]+"&dest="+reservation.destination
      +"&type="+reservation.car_type+"&cars="+reservation.car_number+"&people="+reservation.people_number+"&bags="+reservation.bags
      +"&estimate="+reservation.estimate+"&remarks="+reservation.remarks+"&comp="+reservation.company+"&senpo="+reservation.senpo
      +"&compphone="+reservation.company_phone+"&tanto="+reservation.tanto
}

function node(id) {
  return document.getElementById(id)
}