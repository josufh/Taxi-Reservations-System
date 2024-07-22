import { initializeApp } from "firebase/app";
import { collection, addDoc, getFirestore, Timestamp, doc } from "firebase/firestore";
import { firebaseConfig } from "./env.js"

let curr_open_div = ""

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const res_col_ref = collection(db, "reservations")

window.onload = () => {
  document.getElementById("yoyaku-kakutei-button").onclick = confirmReservation;
  document.getElementById("new-reservation-button").onclick = () => toggleWindow("new-reservation-div", "flex");
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
  
  const reservation_time = document.getElementById("input-time").value
  if (reservation_time == "") {
    fireError("出発時間を選択してください")
    return
  }
  
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
    reservation_time: reservation_time,
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