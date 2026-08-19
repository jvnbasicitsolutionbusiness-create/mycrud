const API_URL = "https://script.google.com/macros/s/AKfycbwjLHXY8luMqmGGhL_6gT3aggM7Mdw_xs9qGM8uTSM-r6dBPhzC5TSTvBdhetzTkshf/exec";

let students = [];
let editingId = null;


// ==============================
// LOAD STUDENTS
// ==============================

async function loadStudents() {

    try {

        const response = await fetch(API_URL);

        const data = await response.json();

        students = data;

        displayStudents(students);

    } catch (error) {

        console.error("Error loading students:", error);

        alert("Failed to load student records.");

    }
}


// ==============================
// DISPLAY STUDENTS
// ==============================

function displayStudents(data) {

    const tableBody =
        document.getElementById("studentTableBody");

    tableBody.innerHTML = "";

    if (data.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;">
                    No records found
                </td>
            </tr>
        `;

        return;
    }

    data.forEach(student => {

        const row = document.createElement("tr");

        row.innerHTML = `

            <td>${student.ID}</td>

            <td>${student["First Name"]}</td>

            <td>${student["Last Name"]}</td>

            <td>${student.Course}</td>

            <td>${student["Year Level"]}</td>

            <td>${student.Email}</td>

            <td>

                <button
                    class="btn-edit"
                    onclick="editStudent('${student.ID}')">
                    Edit
                </button>

                <button
                    class="btn-delete"
                    onclick="deleteStudent('${student.ID}')">
                    Delete
                </button>

            </td>
        `;

        tableBody.appendChild(row);

    });
}


// ==============================
// ADD / UPDATE
// ==============================

document
    .getElementById("studentForm")
    .addEventListener("submit", async function(event) {

        event.preventDefault();

        const firstName =
            document.getElementById("firstName").value;

        const lastName =
            document.getElementById("lastName").value;

        const course =
            document.getElementById("course").value;

        const yearLevel =
            document.getElementById("yearLevel").value;

        const email =
            document.getElementById("email").value;


        // ==========================
        // UPDATE
        // ==========================

        if (editingId !== null) {

            await updateStudent(
                editingId,
                firstName,
                lastName,
                course,
                yearLevel,
                email
            );

        }

        // ==========================
        // CREATE
        // ==========================

        else {

            await addStudent(
                firstName,
                lastName,
                course,
                yearLevel,
                email
            );

        }

    });


// ==============================
// ADD STUDENT
// ==============================

async function addStudent(
    firstName,
    lastName,
    course,
    yearLevel,
    email
) {

    try {

        const response = await fetch(API_URL, {

            method: "POST",

            body: JSON.stringify({

                action: "create",

                firstName: firstName,
                lastName: lastName,
                course: course,
                yearLevel: yearLevel,
                email: email

            })

        });

        const result = await response.json();

        if (result.success) {

            alert("Student added successfully!");

            document
                .getElementById("studentForm")
                .reset();

            loadStudents();

        } else {

            alert("Failed to add student.");

        }

    } catch (error) {

        console.error(error);

        alert("Error adding student.");

    }
}


// ==============================
// EDIT STUDENT
// ==============================

function editStudent(id) {

    const student =
        students.find(item => item.ID == id);

    if (!student) return;

    editingId = id;

    document.getElementById("firstName").value =
        student["First Name"];

    document.getElementById("lastName").value =
        student["Last Name"];

    document.getElementById("course").value =
        student.Course;

    document.getElementById("yearLevel").value =
        student["Year Level"];

    document.getElementById("email").value =
        student.Email;


    document.getElementById("formTitle").textContent =
        "Edit Student";

    document.getElementById("saveBtn").textContent =
        "Update Student";

    document.getElementById("cancelBtn").style.display =
        "block";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ==============================
// UPDATE STUDENT
// ==============================

async function updateStudent(
    id,
    firstName,
    lastName,
    course,
    yearLevel,
    email
) {

    try {

        const response = await fetch(API_URL, {

            method: "POST",

            body: JSON.stringify({

                action: "update",

                id: id,

                firstName: firstName,
                lastName: lastName,
                course: course,
                yearLevel: yearLevel,
                email: email

            })

        });

        const result = await response.json();

        if (result.success) {

            alert("Student updated successfully!");

            cancelEdit();

            loadStudents();

        } else {

            alert("Failed to update student.");

        }

    } catch (error) {

        console.error(error);

        alert("Error updating student.");

    }
}


// ==============================
// DELETE STUDENT
// ==============================

async function deleteStudent(id) {

    const confirmDelete =
        confirm("Are you sure you want to delete this student?");

    if (!confirmDelete) return;

    try {

        const response = await fetch(API_URL, {

            method: "POST",

            body: JSON.stringify({

                action: "delete",

                id: id

            })

        });

        const result = await response.json();

        if (result.success) {

            alert("Student deleted successfully!");

            loadStudents();

        } else {

            alert("Failed to delete student.");

        }

    } catch (error) {

        console.error(error);

        alert("Error deleting student.");

    }
}


// ==============================
// CANCEL EDIT
// ==============================

function cancelEdit() {

    editingId = null;

    document
        .getElementById("studentForm")
        .reset();

    document.getElementById("formTitle").textContent =
        "Add Student";

    document.getElementById("saveBtn").textContent =
        "Add Student";

    document.getElementById("cancelBtn").style.display =
        "none";
}


// ==============================
// SEARCH
// ==============================

function searchStudents() {

    const keyword =
        document
            .getElementById("searchInput")
            .value
            .toLowerCase();

    const filtered =
        students.filter(student => {

            return (

                String(student.ID)
                    .toLowerCase()
                    .includes(keyword)

                ||

                String(student["First Name"])
                    .toLowerCase()
                    .includes(keyword)

                ||

                String(student["Last Name"])
                    .toLowerCase()
                    .includes(keyword)

                ||

                String(student.Course)
                    .toLowerCase()
                    .includes(keyword)

                ||

                String(student.Email)
                    .toLowerCase()
                    .includes(keyword)

            );

        });

    displayStudents(filtered);
}


// ==============================
// INITIAL LOAD
// ==============================

loadStudents();
