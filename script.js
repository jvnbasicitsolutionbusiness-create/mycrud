const API_URL =
    "https://script.google.com/macros/s/AKfycbxiKcV1BydQ8hmQ7woxriH_dlCZByJBPKzaKbNx1sdz3QF_E0P5YIAU8-Qk2kmcqljC/exec";

let students = [];
let editingRow = null;


// ============================================
// LOAD STUDENTS - READ
// ============================================

async function loadStudents() {

    try {

        const response =
            await fetch(API_URL);

        if (!response.ok) {

            throw new Error(
                "HTTP Error: " + response.status
            );

        }


        const result =
            await response.json();


        console.log("GET Response:", result);


        // Check Apps Script response

        if (!result.success) {

            throw new Error(
                result.error ||
                "Failed to load records."
            );

        }


        // IMPORTANT:
        // Apps Script returns { success, messages }

        students =
            result.messages || [];


        displayStudents(students);


    } catch (error) {

        console.error(
            "Error loading students:",
            error
        );

        alert(
            "Failed to load student records.\n\n" +
            error.message
        );

    }

}


// ============================================
// DISPLAY STUDENTS
// ============================================

function displayStudents(data) {

    const tableBody =
        document.getElementById(
            "studentTableBody"
        );


    tableBody.innerHTML = "";


    // No records

    if (!data || data.length === 0) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    style="text-align:center;"
                >
                    No records found
                </td>

            </tr>

        `;

        return;

    }


    // Display records

    data.forEach(student => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${student.ID}
            </td>

            <td>
                ${student["First Name"]}
            </td>

            <td>
                ${student["Last Name"]}
            </td>

            <td>
                ${student.Course}
            </td>

            <td>
                ${student["Year Level"]}
            </td>

            <td>
                ${student.Email}
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


// ============================================
// ADD / UPDATE FORM
// ============================================

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


            // ====================================
            // UPDATE
            // ====================================

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


            // ====================================
            // CREATE
            // ====================================

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


// ============================================
// CREATE STUDENT
// ============================================

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
            "CREATE Response:",
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


        await loadStudents();


    } catch (error) {

        console.error(
            "Add error:",
            error
        );

        alert(
            "Error adding student.\n\n" +
            error.message
        );

    }

}


// ============================================
// EDIT STUDENT
// ============================================

function editStudent(id) {

    const student =
        students.find(

            item =>
                String(item.ID) ===
                String(id)

        );


    if (!student) {

        alert(
            "Student record not found."
        );

        return;

    }


    // IMPORTANT:
    // Use actual Google Sheet row

    editingRow =
        Number(student.row);


    // Fill form

    document
        .getElementById("firstName")
        .value =
        student["First Name"];


    document
        .getElementById("lastName")
        .value =
        student["Last Name"];


    document
        .getElementById("course")
        .value =
        student.Course;


    document
        .getElementById("yearLevel")
        .value =
        student["Year Level"];


    document
        .getElementById("email")
        .value =
        student.Email;


    // Change UI

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
        "block";


    // Scroll to form

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


// ============================================
// UPDATE STUDENT
// ============================================

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
                        row,

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
            "UPDATE Response:",
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
            "Update error:",
            error
        );

        alert(
            "Error updating student.\n\n" +
            error.message
        );

    }

}


// ============================================
// DELETE STUDENT
// ============================================

async function deleteStudent(row) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this student?"
        );


    if (!confirmDelete) {

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
            "DELETE Response:",
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
            "Delete error:",
            error
        );

        alert(
            "Error deleting student.\n\n" +
            error.message
        );

    }

}


// ============================================
// CANCEL EDIT
// ============================================

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


// ============================================
// CLEAR FORM
// ============================================

function clearForm() {

    document
        .getElementById("studentForm")
        .reset();


    editingRow = null;


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


// ============================================
// SEARCH STUDENTS
// ============================================

function searchStudents() {

    const keyword =
        document
            .getElementById("searchInput")
            .value
            .toLowerCase()
            .trim();


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

                String(student["Year Level"])
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


// ============================================
// INITIAL LOAD
// ============================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadStudents();

    }
);
