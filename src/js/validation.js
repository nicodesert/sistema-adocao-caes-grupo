function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

function validatePassword(password) {
    return password.length >= 6; // Example: Password must be at least 6 characters long
}

function validateRegistrationForm(form) {
    const email = form.email.value;
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;

    if (!validateEmail(email)) {
        alert("Please enter a valid email address.");
        return false;
    }

    if (!validatePassword(password)) {
        alert("Password must be at least 6 characters long.");
        return false;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return false;
    }

    return true; // All validations passed
}

function validateLoginForm(form) {
    const email = form.email.value;
    const password = form.password.value;

    if (!validateEmail(email)) {
        alert("Please enter a valid email address.");
        return false;
    }

    if (!validatePassword(password)) {
        alert("Password must be at least 6 characters long.");
        return false;
    }

    return true; // All validations passed
}