
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtbGtjdGdjeWlhYnR0cG5iYWN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0MDg5ODAsImV4cCI6MjA4NTk4NDk4MH0.l8bJ0kHi0QcmqjmV64KD9ExhCVqGhI2lbpi38ZG4il8";
const parts = token.split('.');
const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
console.log(payload);
