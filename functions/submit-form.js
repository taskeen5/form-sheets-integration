async function handleSubmit(event) {
  event.preventDefault();

  const formData = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    message: document.getElementById("message").value,
  };

  try {
    const response = await fetch("/.netlify/functions/submit-form", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const result = await response.json();

    if (!response.ok) {
      // Server responded with error
      alert(`Error: ${result.error || "Something went wrong!"}`);
    } else {
      // Success
      alert(result.message);
      document.getElementById("contactForm").reset();
    }
  } catch (err) {
    console.error("❌ Fetch failed:", err);
    alert("Network error. Please try again later.");
  }
}
