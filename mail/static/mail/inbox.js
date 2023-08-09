document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', send_email);
  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#view-mail').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function viewEmail(emailID) {
  document.querySelector('#view-mail').style.display = 'none';
  fetch(`/emails/${emailID}`)
  .then(response => response.json())
  .then(email => {
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#view-mail').style.display = 'block';
  
    document.querySelector('#view-mail').className = "list-group-item";
    document.querySelector('#view-mail').innerHTML = `
    <h3>Sender: ${email.sender}</h3>
    <h3>Recipients: ${email.recipients}</h3>
    <h4>Subject: ${email.subject}</h4>
    <p>${email.timestamp}</p>
    <h5>${email.body}</h5>
    `;

    if (email.read == false ) {
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          read: true
        })
      })
    }

    const element = document.createElement('button');
    element.innerHTML = email.archived ? "Unarchive": "Archive";
    element.className = "btn btn-secondary";
    element.addEventListener("click", function() {
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          archived: !email.archived
        })
      })
      .then(() => {load_mailbox('inbox')});
    })

    const element2 = document.createElement('button');
    element2.innerHTML = 'Reply';
    element2.className = "btn btn-secondary";
    element2.style.marginLeft = "10px";
    element2.addEventListener("click", function() {
      compose_email();
      document.querySelector('#compose-recipients').value = `${email.sender}`;
      document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
      let subject = email.subject;
      if (subject.includes("Re: ")) {
        document.querySelector('#compose-subject').value = '';
      } else {
        document.querySelector('#compose-subject').value = 'Re: ';
      }
    })

    document.querySelector('#view-mail').append(element, element2);
  });
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#view-mail').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      emails.forEach(email => {
        const eachEmail = document.createElement('div');
        eachEmail.className = "list-group-item";
        eachEmail.innerHTML = `
        <h4>Sender: ${email.sender}</h4>
        <h5>Subject: ${email.subject}</h5>
        <p>${email.timestamp}</p>`;

        if (email.read == true) {
          eachEmail.style.backgroundColor = "LightGray";
        } else {
          eachEmail.style.backgroundColor = "white";
        }

        eachEmail.addEventListener('mouseover', function() {
            eachEmail.style.cursor = 'pointer';
        })   
        eachEmail.addEventListener('click', function() {
          viewEmail(email.id);
        });
        document.querySelector('#emails-view').append(eachEmail);
      })
  });
}

function send_email(event) {
  event.preventDefault();
  const recipient = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipient,
        subject: subject,
        body: body
  })})
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      load_mailbox('sent');
  });
}