const API_URL =
    "https://script.google.com/macros/s/AKfycbxiKcV1BydQ8hmQ7woxriH_dlCZByJBPKzaKbNx1sdz3QF_E0P5YIAU8-Qk2kmcqljC/exec";

let students = [];
let editingRow = null;


// ======================================================
// LOAD STUDENTS
// ======================================================

async function loadStudents() {

    const tableBody =
        document.getElementById("studentTableBody");

    // Show loading

    tableBody.innerHTML = `
        <tr>
            <td colspan="7" style="text-align:center;">
                Loading student records...
            </td>
        </tr>
    `;


    try {

        // Add timestamp to prevent cached response

        const response = await fetch(
            API_URL + "?t=" + new Date().getTime()
        );


        if (!response.ok) {

            throw new Error(
                "HTTP Error: " + response.status
            );

        }


        const result =
            await response.json();


        console.log(
            "APPS SCRIPT GET RESPONSE:",
            result
        );


        // ==================================================
        // HANDLE DIFFERENT RESPONSE FORMATS
        // ==================================================

        if (Array.isArray(result)) {

            students = result;

        }

        else if (
            result &&
            Array.isArray(result.data)
        ) {

            students = result.data;

        }

        else if (
            result &&
            Array.isArray(result.messages)
        ) {

            students = result.messages;

        }

        else {

            throw new Error(
                result.error ||
                "No student data received from Google Sheets."
            );

        }


        console.log(
            "STUDENTS LOADED:",
            students
        );


        displayStudents(students);


    } catch (error) {

        console.error(
            "LOAD ERROR:",
            error
        );


        students = [];


        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center; color:red;">
                    Failed to load student records.
                    <br>
                    ${error.message}
                </td>
            </tr>
        `;

    }

}


// ======================================================
// DISPLAY STUDENTS
// ======================================================

function displayStudents(data) {

    const tableBody =
        document.getElementById(
            "studentTableBody"
        );


    tableBody.innerHTML = "";


    if (
        !data ||
        data.length === 0
    ) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;">
                    No records found
                </td>
            </tr>
        `;

        return;
    }


    data.forEach(function(student) {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${student.ID ?? ""}
            </td>

            <td>
                ${student["First Name"] ?? ""}
            </td>

            <td>
                ${student["Last Name"] ?? ""}
            </td>

            <td>
                ${student.Course ?? ""}
            </td>

            <td>
                ${student["Year Level"] ?? ""}
            </td>

            <td>
                ${student.Email ?? ""}
            </td>

            <td>

                <button
                    type="button"
                    class="btn-edit"
                    onclick="editStudent('${student.ID}')"
                >
                    Edit
                </button>

                <button
                    type="button"
                    class="btn-delete"
                    onclick="deleteStudent(${student.row})"
                >
                    Delete
                </button>

            </td>

        `;


        tableBody.appendChild(row);

    });

}


// ======================================================
// CREATE / UPDATE
// ======================================================

document
    .getElementById("studentForm")
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const firstName =
                document
                    .getElementById("firstName")
                    .value
                    .trim();


            const lastName =
                document
                    .getElementById("lastName")
                    .value
                    .trim();


            const course =
                document
                    .getElementById("course")
                    .value
                    .trim();


            const yearLevel =
                document
                    .getElementById("yearLevel")
                    .value;


            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();


            if (!firstName ||
                !lastName ||
                !course ||
                !yearLevel ||
                !email) {

                alert(
                    "Please complete all fields."
                );

                return;
            }


            // UPDATE

            if (editingRow !== null) {

                await updateStudent(

                    editingRow,

                    firstName,

                    lastName,

                    course,

                    yearLevel,

                    email

                );

            }


            // CREATE

            else {

                await addStudent(

                    firstName,

                    lastName,

                    course,

                    yearLevel,

                    email

                );

            }

        }
    );


// ======================================================
// CREATE STUDENT
// ======================================================

async function addStudent(
    firstName,
    lastName,
    course,
    yearLevel,
    email
) {

    try {

        const response =
            await fetch(API_URL, {

                method: "POST",

                body: JSON.stringify({

                    action: "create",

                    firstName:
                        firstName,

                    lastName:
                        lastName,

                    course:
                        course,

                    yearLevel:
                        yearLevel,

                    email:
                        email

                })

            });


        const result =
            await response.json();


        console.log(
            "CREATE RESPONSE:",
            result
        );


        if (!result.success) {

            throw new Error(
                result.error ||
                "Failed to add student."
            );

        }


        alert(
            "Student added successfully!"
        );


        clearForm();


        // IMPORTANT:
        // Reload table after saving

        await loadStudents();


    } catch (error) {

        console.error(
            "CREATE ERROR:",
            error
        );


        alert(
            "Error adding student:\n\n" +
            error.message
        );

    }

}


// ======================================================
// EDIT STUDENT
// ======================================================

function editStudent(id) {

    const student =
        students.find(function(item) {

            return String(item.ID) ===
                   String(id);

        });


    if (!student) {

        alert(
            "Student record not found."
        );

        return;
    }


    editingRow =
        Number(student.row);


    document
        .getElementById("firstName")
        .value =
        student["First Name"] || "";


    document
        .getElementById("lastName")
        .value =
        student["Last Name"] || "";


    document
        .getElementById("course")
        .value =
        student.Course || "";


    document
        .getElementById("yearLevel")
        .value =
        student["Year Level"] || "";


    document
        .getElementById("email")
        .value =
        student.Email || "";


    document
        .getElementById("formTitle")
        .textContent =
        "Edit Student";


    document
        .getElementById("saveBtn")
        .textContent =
        "Update Student";


    document
        .getElementById("cancelBtn")
        .style.display =
        "inline-block";


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


// ======================================================
// UPDATE STUDENT
// ======================================================

async function updateStudent(
    row,
    firstName,
    lastName,
    course,
    yearLevel,
    email
) {

    try {

        const response =
            await fetch(API_URL, {

                method: "POST",

                body: JSON.stringify({

                    action: "update",

                    row:
                        Number(row),

                    firstName:
                        firstName,

                    lastName:
                        lastName,

                    course:
                        course,

                    yearLevel:
                        yearLevel,

                    email:
                        email

                })

            });


        const result =
            await response.json();


        console.log(
            "UPDATE RESPONSE:",
            result
        );


        if (!result.success) {

            throw new Error(
                result.error ||
                "Failed to update student."
            );

        }


        alert(
            "Student updated successfully!"
        );


        cancelEdit();


        await loadStudents();


    } catch (error) {

        console.error(
            "UPDATE ERROR:",
            error
        );


        alert(
            "Error updating student:\n\n" +
            error.message
        );

    }

}


// ======================================================
// DELETE STUDENT
// ======================================================

async function deleteStudent(row) {

    if (
        !confirm(
            "Are you sure you want to delete this student?"
        )
    ) {

        return;

    }


    try {

        const response =
            await fetch(API_URL, {

                method: "POST",

                body: JSON.stringify({

                    action: "delete",

                    row:
                        Number(row)

                })

            });


        const result =
            await response.json();


        console.log(
            "DELETE RESPONSE:",
            result
        );


        if (!result.success) {

            throw new Error(
                result.error ||
                "Failed to delete student."
            );

        }


        alert(
            "Student deleted successfully!"
        );


        await loadStudents();


    } catch (error) {

        console.error(
            "DELETE ERROR:",
            error
        );


        alert(
            "Error deleting student:\n\n" +
            error.message
        );

    }

}


// ======================================================
// CANCEL EDIT
// ======================================================

function cancelEdit() {

    editingRow = null;


    document
        .getElementById("studentForm")
        .reset();


    document
        .getElementById("formTitle")
        .textContent =
        "Add Student";


    document
        .getElementById("saveBtn")
        .textContent =
        "Add Student";


    document
        .getElementById("cancelBtn")
        .style.display =
        "none";

}


// ======================================================
// CLEAR FORM
// ======================================================

function clearForm() {

    editingRow = null;


    document
        .getElementById("studentForm")
        .reset();


    document
        .getElementById("formTitle")
        .textContent =
        "Add Student";


    document
        .getElementById("saveBtn")
        .textContent =
        "Add Student";


    document
        .getElementById("cancelBtn")
        .style.display =
        "none";

}


// ======================================================
// SEARCH
// ======================================================

function searchStudents() {

    const keyword =
        document
            .getElementById("searchInput")
            .value
            .toLowerCase()
            .trim();


    // If search is empty,
    // show ALL students

    if (keyword === "") {

        displayStudents(students);

        return;

    }


    const filtered =
        students.filter(function(student) {

            const id =
                String(student.ID || "")
                    .toLowerCase();

            const firstName =
                String(
                    student["First Name"] || ""
                )
                    .toLowerCase();

            const lastName =
                String(
                    student["Last Name"] || ""
                )
                    .toLowerCase();

            const course =
                String(
                    student.Course || ""
                )
                    .toLowerCase();

            const yearLevel =
                String(
                    student["Year Level"] || ""
                )
                    .toLowerCase();

            const email =
                String(
                    student.Email || ""
                )
                    .toLowerCase();


            return (

                id.includes(keyword) ||

                firstName.includes(keyword) ||

                lastName.includes(keyword) ||

                course.includes(keyword) ||

                yearLevel.includes(keyword) ||

                email.includes(keyword)

            );

        });


    displayStudents(filtered);

}


// ======================================================
// PAGE LOAD
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadStudents();

    }
);
