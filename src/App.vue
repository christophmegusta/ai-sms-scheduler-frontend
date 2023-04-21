<script setup>
import { ref, onMounted } from "vue";
// greyed out / not in this file used values are used in App.html instead
import { fetchJSON, fetchPostJSON, formatDate } from "./utility";
import Siws from "./components/Siws.vue";


const token = ref(window.localStorage.token);
const phone = ref("");
const message = ref("");
const sendAt = ref(new Date().toISOString().slice(0, 16));
const timeWindow = ref(0);
const sendChance = ref(100);
const recurrence = ref("once");
const messageId = ref(null);
const messages = ref([]);

function setToken(t) {
  token.value = t;
  window.localStorage.token = t;
  fetchScheduledMessages();
}

function resetForm() {
  phone.value = "";
  message.value = "";
  sendAt.value = new Date().toISOString().slice(0, 16);
  timeWindow.value = 0;
  sendChance.value = 100;
  recurrence.value = "once";
  messageId.value = null;
}

const submitForm = async () => {
  const sendAtDate = new Date(sendAt.value);
  const sendAtTimestamp = Math.floor(sendAtDate.getTime() / 1000);

  if (messageId.value) {
  await fetchPostJSON("/saveScheduledMessage", { id: messageId.value, phone: phone.value, message: message.value, sendAt: sendAtTimestamp, recurrence: recurrence.value, sendChance: sendChance.value, timeWindow: timeWindow.value });
  } else {
  await fetchPostJSON("/schedule", { phone: phone.value, message: message.value, sendAt: sendAtTimestamp, recurrence: recurrence.value, sendChance: sendChance.value, timeWindow: timeWindow.value });
  }

  messageId.value = null;
  fetchScheduledMessages();
  resetForm();
};

const fetchScheduledMessages = async () => {
  messages.value = await fetchJSON("/messages");
};

onMounted(async () => {
  fetchScheduledMessages();
  token.value = window.localStorage.token;
});



const getLabelColor = (recurrence) => {
  switch (recurrence) {
      case "once":
      return "grey";
      case "daily":
      return "olive";
      case "weekly":
      return "teal";
      case "monthly":
      return "blue";
      case "yearly":
      return "purple";
      default:
      return "grey";
  }
};

const editScheduledMessage = (msg) => {
  phone.value = msg.phone;
  message.value = msg.message;

  const sendAtDate = new Date(msg.send_at * 1000);
  const timezoneOffset = sendAtDate.getTimezoneOffset() * 60 * 1000;
  const adjustedTimestamp = sendAtDate.getTime() - timezoneOffset;
  sendAt.value = new Date(adjustedTimestamp).toISOString().slice(0, 16);

  recurrence.value = msg.recurrence;
  timeWindow.value = msg.time_window;
  sendChance.value = msg.send_chance;

  // Save the ID of the message being edited
  messageId.value = msg.id;
};

const deleteScheduledMessage = async (id) => {
  await fetchPostJSON("/deleteScheduledMessage", { id });
  fetchScheduledMessages();
};
</script>

<template src="./App.html">
</template>

<style>
</style>
