# API SPECIFICATION

---

Authentication

POST /api/auth/register

Body

{
"name": "John",
"email": "[john@email.com](mailto:john@email.com)",
"password": "123456"
}

---

POST /api/auth/login

Returns JWT token.

---

Modules

GET /api/modules

Returns training modules.

---

GET /api/modules/:id

Returns module details.

---

Quiz

GET /api/quiz/:moduleId

Returns quiz questions.

---

POST /api/quiz/submit

Body

{
"userId": "1",
"moduleId": "1",
"answers": ["A","C","B"]
}

Returns score.

---

Progress

POST /api/progress

Marks module complete.

---

Certificate

GET /api/certificate/:moduleId

Returns certificate data.
