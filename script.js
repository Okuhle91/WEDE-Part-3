// ============================================================
//  Okza's FrostFlow Industries - site JavaScript
//  Features:
//   1. Time-based welcome greeting (Homepage)
//   2. Active navigation link highlighting (all pages)
//   3. Contact form validation (Contact Us page)
//   4. Gallery lightbox with prev / next (Gallery page)
//   5. Back-to-top button (all pages)
//   6. Dynamic footer copyright year (all pages)
// ============================================================

document.addEventListener("DOMContentLoaded", function () {

  /* ---------- 1. Welcome greeting (Homepage only) ---------- */
  // Adds a personalised greeting above the main heading on the homepage.
  (function welcomeGreeting() {
    if (!document.title.toLowerCase().includes("homepage")) return;

    var hour = new Date().getHours();
    var greeting;
    if (hour < 12)      greeting = "Good morning";
    else if (hour < 18) greeting = "Good afternoon";
    else                greeting = "Good evening";

    var h1 = document.querySelector("main h1");
    if (h1) {
      var p = document.createElement("p");
      p.id = "greeting";
      p.textContent = greeting + "! Welcome to Okza's FrostFlow Industries.";
      h1.parentNode.insertBefore(p, h1);
    }
  })();

  /* ---------- 2. Highlight the current page in the nav ---------- */
  (function highlightNav() {
    // "Index.html", "About%20us.html" etc. -> "index.html", "about us.html"
    var current = decodeURIComponent(window.location.pathname.split("/").pop()).toLowerCase();
    document.querySelectorAll("nav a").forEach(function (link) {
      var target = decodeURIComponent(link.getAttribute("href")).toLowerCase();
      if (target === current) link.classList.add("active");
    });
  })();

  /* ---------- 3. Contact form validation (Contact Us page) ---------- */
  (function contactFormValidation() {
    var form = document.querySelector("main form");
    if (!form) return; // only runs on the page that has a form

    // Build an area where error / success messages will be shown.
    var msgBox = document.createElement("div");
    msgBox.id = "formMsg";
    form.parentNode.insertBefore(msgBox, form);

    form.addEventListener("submit", function (event) {
      event.preventDefault(); // stop the page from reloading

      // Trimmed values from each field
      var name    = form.querySelector("#name").value.trim();
      var surname = form.querySelector("#surname").value.trim();
      var phone   = form.querySelector("#phone").value.trim();
      var address = form.querySelector("#Address").value.trim();
      var email   = form.querySelector("#email").value.trim();
      var message = form.querySelector("#message").value.trim();

      var errors = [];

      // --- required fields ---
      if (name === "")    errors.push("Please enter your name.");
      if (surname === "") errors.push("Please enter your surname.");
      if (address === "") errors.push("Please enter your address.");
      if (message === "") errors.push("Please write a message.");

      // --- email format (simple standard pattern) ---
      var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (email === "") errors.push("Please enter your email address.");
      else if (!emailPattern.test(email)) errors.push("Please enter a valid email address.");

      // --- phone: digits, spaces, + - ( ) only, 10+ digits ---
      var phoneDigits = phone.replace(/\D/g, "");
      if (phone === "") errors.push("Please enter your phone number.");
      else if (!/^[\d\s+\-()]+$/.test(phone)) errors.push("Phone number may only contain digits, spaces, + - ( ).");
      else if (phoneDigits.length < 10) errors.push("Phone number must have at least 10 digits.");

      // --- show result ---
      if (errors.length > 0) {
        msgBox.className = "form-msg error";
        msgBox.innerHTML = "<strong>Please fix the following:</strong><ul><li>" +
                           errors.join("</li><li>") + "</li></ul>";
        msgBox.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        // All fields are valid - send the enquiry by email.
        msgBox.className = "form-msg";
        msgBox.style.backgroundColor = "#e7f1ff";
        msgBox.style.color = "#084298";
        msgBox.style.border = "1px solid #b6d4fe";
        msgBox.innerHTML = "Sending your enquiry...";

        // Free email relay: forwards the form to your Gmail address.
        // FIRST USE ONLY: FormSubmit emails YOU a confirmation link -
        // click it once, then all future enquiries arrive automatically.
        fetch("https://formsubmit.co/ajax/okuhleentle466@gmail.com", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({
            _subject: "New website enquiry from " + name + " " + surname,
            _template: "table",
            _captcha: "false",
            Name: name,
            Surname: surname,
            Phone: phone,
            Address: address,
            Email: email,
            Message: message
          })
        })
        .then(function (response) {
          if (!response.ok) throw new Error("Request failed");
          return response.json();
        })
        .then(function () {
          msgBox.className = "form-msg success";
          msgBox.removeAttribute("style");
          msgBox.innerHTML = "<strong>Thank you, " + name + "!</strong> Your enquiry has been " +
                             "sent to our team. We will get back to you as soon as possible.";
          form.reset();
          msgBox.scrollIntoView({ behavior: "smooth", block: "center" });
        })
        .catch(function () {
          // Backup plan: open the visitor's own email app pre-filled,
          // so the enquiry can still reach okuhleentle466@gmail.com.
          var subject = encodeURIComponent("Website enquiry from " + name + " " + surname);
          var body = encodeURIComponent(
            "Name: " + name + "\nSurname: " + surname +
            "\nPhone: " + phone + "\nAddress: " + address +
            "\nEmail: " + email + "\n\nMessage:\n" + message
          );
          msgBox.className = "form-msg error";
          msgBox.removeAttribute("style");
          msgBox.innerHTML = "<strong>The online sender is unavailable right now.</strong> " +
                             "Your email app is opening with your enquiry pre-filled - " +
                             "just press Send, or email us directly at okuhleentle466@gmail.com.";
          window.location.href = "mailto:okuhleentle466@gmail.com?subject=" + subject + "&body=" + body;
        });
      }
    });
  })();

  /* ---------- 4. Gallery lightbox (Gallery page) ---------- */
  (function galleryLightbox() {
    var gallery = document.getElementById("gallery");
    if (!gallery) return;

    var images = Array.prototype.slice.call(gallery.querySelectorAll("img"));
    var index = 0;

    // Mark gallery images as clickable.
    images.forEach(function (img, i) {
      img.classList.add("gallery-img");
      img.addEventListener("click", function () { open(i); });
    });

    // Create the lightbox overlay once.
    var lightbox = document.createElement("div");
    lightbox.id = "lightbox";
    lightbox.innerHTML =
      '<span class="lb-close" title="Close">&times;</span>' +
      '<span class="lb-arrow lb-prev" title="Previous">&#10094;</span>' +
      '<img class="lb-img" src="" alt="Gallery image enlarged">' +
      '<span class="lb-arrow lb-next" title="Next">&#10095;</span>' +
      '<div class="lb-counter"></div>';
    document.body.appendChild(lightbox);

    var lbImg     = lightbox.querySelector(".lb-img");
    var lbCounter = lightbox.querySelector(".lb-counter");

    function open(i) {
      index = i;
      update();
      lightbox.classList.add("open");
      document.body.style.overflow = "hidden"; // stop background scrolling
    }

    function close() {
      lightbox.classList.remove("open");
      document.body.style.overflow = "";
    }

    function update() {
      lbImg.src = images[index].src;
      lbCounter.textContent = (index + 1) + " / " + images.length;
    }

    function step(delta) {
      index = (index + delta + images.length) % images.length;
      update();
    }

    lightbox.querySelector(".lb-close").addEventListener("click", close);
    lightbox.querySelector(".lb-prev").addEventListener("click", function () { step(-1); });
    lightbox.querySelector(".lb-next").addEventListener("click", function () { step(1); });
    lightbox.addEventListener("click", function (e) { if (e.target === lightbox) close(); });

    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("open")) return;
      if (e.key === "Escape")     close();
      if (e.key === "ArrowLeft")  step(-1);
      if (e.key === "ArrowRight") step(1);
    });
  })();

  /* ---------- 5. Back-to-top button (all pages) ---------- */
  (function backToTop() {
    var btn = document.createElement("button");
    btn.id = "backToTop";
    btn.innerHTML = "&#8679; Top";
    btn.title = "Back to top";
    document.body.appendChild(btn);

    window.addEventListener("scroll", function () {
      btn.classList.toggle("visible", window.scrollY > 300);
    });

    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  })();

  /* ---------- 6. Live date & time in the footer (all pages) ---------- */
  (function footerClock() {
    // Keep the copyright year up to date.
    var year = new Date().getFullYear();
    document.querySelectorAll("footer").forEach(function (f) {
      f.innerHTML = f.innerHTML.replace(/20\d{2}/, year);
    });

    // Add a live clock line to every footer.
    document.querySelectorAll("footer").forEach(function (f) {
      var clock = document.createElement("div");
      clock.id = "footerClock";
      f.appendChild(clock);
    });

    function updateClock() {
      var now = new Date();
      var options = {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit"
      };
      var text = now.toLocaleDateString("en-ZA", options);
      document.querySelectorAll("#footerClock").forEach(function (c) {
        c.textContent = "🕒 " + text;
      });
    }

    updateClock();                 // show immediately
    setInterval(updateClock, 1000); // refresh every second
  })();

  /* ---------- 7. Social media icons in the footer (all pages) ----------
     NOTE TO OWNER: replace the href="#" placeholders below with your
     real page URLs, e.g.
       https://www.facebook.com/YourPageName
       https://www.instagram.com/YourPageName
       https://wa.me/27123456789   (country code + number, no spaces) */
  (function socialIcons() {
    var icons =
      '<a class="social-icon" href="https://www.facebook.com/Okuhle Mlamla" target="_blank" aria-label="Facebook">' +
        '<svg viewBox="0 0 24 24"><path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.09 24 18.1 24 12.07z"/></svg>' +
      "</a>" +
      '<a class="social-icon" href="https://www.instagram.com/Okza Mlamla" target="_blank" aria-label="Instagram">' +
        '<svg viewBox="0 0 24 24"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95C23.78 2.7 21.36.27 17 .07 15.67.01 15.26 0 12 0zm0 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84zM12 16a4 4 0 1 1 4-4 4 4 0 0 1-4 4zm6.4-11.85a1.44 1.44 0 1 0 1.44 1.44 1.44 1.44 0 0 0-1.44-1.44z"/></svg>' +
      "</a>" +
      '<a class="social-icon" href="https://wa.me/27606879399" target="_blank" aria-label="WhatsApp">' +
        '<svg viewBox="0 0 24 24"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.44-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49 -.5 -.67 -.51h -.57c -.2 0 -.52 .07 -.8 .37 -.27 .3 -1.04 1.02 -1.04 2.5 0 1.47 1.07 2.9 1.22 3.1 .15 .2 2.1 3.2 5.08 4.49 .71 .3 1.２６ .４９ １．７．６２ .７１ .２３ １．３６ .２ １．８７ .１２ .５７ -.０８ １．７６ -.７２ ２ -１．４１ .２５ -.７ .２５ -１．２９ .１８ -１．４１ -.０８ -.１３ -.２８ -.２ -.５７ -.３５z"/></svg>' +
      "</a>";

    document.querySelectorAll("footer").forEach(function (f) {
      var row = document.createElement("div");
      row.className = "social-row";
      row.innerHTML = icons;
      f.appendChild(row);
    });
  })();

});
