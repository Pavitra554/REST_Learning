const sendGrid = require("@sendgrid/mail");

sendGrid.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeMail = (email) => {
  sendGrid
    .send({
      to: email,
      from: "pavitrabehara.c4o@gmail.com",
      subject: "Thanks for joining in!",
      text: `Welcome!`,
    })
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.error(error);
    });
};

const sendCanellationMail = (email) => {
  sendGrid
    .send({
      to: email,
      from: "pavitrabehara.c4o@gmail.com",
      subject: "Thanks!",
      text: `Bye Bye!`,
    })
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.error(error);
    });
};

module.exports = {
  sendWelcomeMail,
  sendCanellationMail
}
