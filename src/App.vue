<template>
  <div class="container mx-auto px-4">
    <h1 class="text-3xl font-bold mb-4">SMS Scheduler</h1>

    <form @submit.prevent="submitForm" @reset.prevent="resetForm" class="space-y-4">
      <div>
        <label class="block text-sm font-medium">Phone Number</label>
        <input type="text" v-model="phone" placeholder="Phone Number" required class="block w-full border-gray-300 rounded-md" />
      </div>
      <div>
        <label class="block text-sm font-medium">Message</label>
        <textarea v-model="message" placeholder="Message" required class="block w-full border-gray-300 rounded-md"></textarea>
      </div>
      <div>
        <label class="block text-sm font-medium">Send At</label>
        <input type="datetime-local" v-model="sendAt" required class="block w-full border-gray-300 rounded-md" />
      </div>
      <div>
        <label class="block text-sm font-medium">Time Window (in minutes)</label>
        <input type="number" v-model.number="timeWindow" min="0" max="1440" step="1" required class="block w-full border-gray-300 rounded-md" />
      </div>
      <div>
        <label class="block text-sm font-medium">Send Chance (in percent, 0 - 100)</label>
        <input type="number" v-model.number="sendChance" min="0" max="100" step="1" required class="block w-full border-gray-300 rounded-md" />
      </div>
      <div>
        <label class="block text-sm font-medium">Recurrence</label>
        <select v-model="recurrence" required class="block w-full border-gray-300 rounded-md">
          <option value="once">Once</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>
      <button class="bg-blue-600 text-white px-4 py-2 rounded-md" type="submit">Save Message</button>
      <button class="bg-red-500 text-white px-4 py-2 rounded-md" type="reset">Reset</button>
    </form>

    <h2 class="text-2xl font-bold mt-8 mb-4">Scheduled Messages</h2>
    <table class="min-w-full divide-y divide-gray-200">
      <thead>
        <tr>
          <th class="text-left text-sm font-medium">Phone Number</th>
          <th class="text-left text-sm font-medium">Message</th>
          <th class="text-left text-sm font-medium">Send At</th>
          <th class="text-left text-sm font-medium">Time Window</th>
          <th class="text-left text-sm font-medium">Send Chance</th>
          <th class="text-left text-sm font-medium">Recurrence</th>
          <th class="text-left text-sm font-medium">Actions</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200">
        <tr v-for="message in messages" :key="message.id">
          <td class="py-2">{{ message.phone }}</td>
          <td class="">{{ message.message }}</td>
          <td>{{ formatDate(message.send_at) }}</td>
          <td>{{ message.time_window }}</td>
          <td>{{ message.send_chance }}%</td>
          <td>
            <label :class="['inline-block px-2 py-1 rounded-md', getLabelColor(message.recurrence)]">
              {{ message.recurrence }} ({{ message.occurrences }})
            </label>
          </td>
          <td>
            <button class="bg-blue-500 text-white px-2 py-1 rounded-md mr-1" @click="editScheduledMessage(message)">Edit</button>
            <button class="bg-red-500 text-white px-2 py-1 rounded-md" @click="deleteScheduledMessage(message.id)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const phone = ref("");
const message = ref("");
const sendAt = ref("");
const timeWindow = ref(0);
const sendChance = ref(100);
const recurrence = ref("once");
const messageId = ref(null);
const messages = ref([]);

function resetForm() {
  phone.value = "";
  message.value = "";
  sendAt.value = "";
  timeWindow.value = 0;
  sendChance.value = 100;
  recurrence.value = "once";
  messageId.value = null;
}

  const fetchJSON = async (url) => {
      const response = await fetch(`http://localhost:3000${url}`);
      return response.json();
  };

  const fetchPostJSON = async (url, data) => {
      const response = await fetch(`http://localhost:3000${url}`, {
      method: "POST",
      headers: {
      "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      });
      return response;
  };

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

onMounted(fetchScheduledMessages);

const formatDate = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return `${date.toLocaleDateString()}, ${date.toLocaleTimeString()}`;
};

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

<style>
</style>
