javascript
// ================= MOBILE MENU =================

function toggleMenu() {
    const navLinks = document.querySelector(".nav-links");

    navLinks.classList.toggle("active");
}


// Close mobile menu after clicking a link

const navItems = document.querySelectorAll(".nav-links a");

navItems.forEach(function (item) {

    item.addEventListener("click", function () {

        document.querySelector(".nav-links")
            .classList.remove("active");

    });

});


// ================= CONTACT FORM =================
// ===============================
// CONTACT FORM - FORMSPREE AJAX
// ===============================

const contactForm = document.getElementById("contactForm");
const submitBtn = document.getElementById("submitBtn");
const formStatus = document.getElementById("formStatus");

if (contactForm) {

    contactForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        // Change button while sending
        submitBtn.textContent = "Sending...";
        submitBtn.disabled = true;

        const formData = new FormData(contactForm);

        try {

            const response = await fetch(
                "https://formspree.io/f/maeynabn",
                {
                    method: "POST",
                    body: formData,
                    headers: {
                        "Accept": "application/json"
                    }
                }
            );

            if (response.ok) {

                formStatus.textContent =
                    "✓ Thank you! Your message has been sent successfully.";

                formStatus.style.color = "#16a34a";

                contactForm.reset();

                submitBtn.textContent = "Message Sent ✓";

                setTimeout(function () {
                    submitBtn.textContent = "Send Message →";
                    submitBtn.disabled = false;
                }, 3000);

            } else {

                formStatus.textContent =
                    "✕ Something went wrong. Please try again.";

                formStatus.style.color = "#dc2626";

                submitBtn.textContent = "Send Message →";
                submitBtn.disabled = false;
            }

        } catch (error) {

            formStatus.textContent =
                "✕ Unable to send message. Please try again.";

            formStatus.style.color = "#dc2626";

            submitBtn.textContent = "Send Message →";
            submitBtn.disabled = false;

        }

    });

}
