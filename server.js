const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// Mock database with authors and their books (titles only)
const authors = {
  "J.K. Rowling": [
    "Harry Potter and the Sorcerer’s Stone",
    "Harry Potter and the Chamber of Secrets",
    "Harry Potter and the Prisoner of Azkaban",
    "Harry Potter and the Goblet of Fire",
    "Harry Potter and the Order of the Phoenix",
    "Harry Potter and the Half-Blood Prince",
    "Harry Potter and the Deathly Hallows"
  ],
  "Yann Martel": [
    "Life of Pi"
  ],
  "Markus Zusak": [
    "The Book Thief"
  ],
  "J.R.R. Tolkien": [
    "The Hobbit",
    "The Lord of the Rings",
    "The Fellowship of the Ring",
    "The Two Towers",
    "The Return of the King"
  ],
  "Harper Lee": [
    "To Kill a Mockingbird"
  ],
  "Jane Austen": [
    "Pride and Prejudice"
  ],
  "George Orwell": [
    "1984"
  ],
  "F. Scott Fitzgerald": [
    "The Great Gatsby"
  ],
  "Herman Melville": [
    "Moby-Dick"
  ],
  "J.D. Salinger": [
    "The Catcher in the Rye"
  ],
  "Paulo Coelho": [
    "The Alchemist"
  ],
  "Suzanne Collins": [
    "The Hunger Games",
    "Catching Fire",
    "Mockingjay"
  ],
  "John Green": [
    "The Fault in Our Stars"
  ],
  "Dan Brown": [
    "The Da Vinci Code"
  ],
  "James Clear": [
    "Atomic Habits"
  ],
  "Héctor García and Francesc Miralles": [
    "Ikigai"
  ],
  "Robert Kiyosaki": [
    "Rich Dad Poor Dad"
  ],
  "Stephen Covey": [
    "The 7 Habits of Highly Effective People"
  ],
  "Mark Manson": [
    "The Subtle Art of Not Giving a F*ck"
  ]
};

// Webhook endpoint
app.post("/webhook", (req, res) => {
    const intent = req.body.queryResult.intent.displayName;

    switch (intent) {
        // ----------------------------------------------------
        // 1. User searches for books by author
        // ----------------------------------------------------
        case "Search Book By Author": {
            const author = req.body.queryResult.parameters.author_name;

            if (!authors[author]) {
                return res.json({
                    fulfillmentText: `Sorry, I don’t have books listed for ${author}.`
                });
            }

            const list = authors[author].map((b, i) => `${i + 1}. ${b}`).join("\n");

            return res.json({
                fulfillmentText:
                    `Here are the books by ${author}:\n\n${list}\n\nWould you like to reserve one of these?`,
                outputContexts: [
                    {
                        name: `${req.body.session}/contexts/awaiting_reservation_confirmation`,
                        lifespanCount: 5
                    }
                ]
            });
        }

        // ----------------------------------------------------
        // 2. User chooses a book — webhook checks availability
        // ----------------------------------------------------
        case "ReservationCheckAvailabilityIntent": {
            const book = req.body.queryResult.parameters.book_name;

            if (!bookAvailability[book]) {
                return res.json({
                    fulfillmentText: `I couldn't find availability info for "${book}".`
                });
            }

            const available = bookAvailability[book];

            return res.json({
                fulfillmentText: available
                  ? `"${book}" is available! Would you like to reserve it?`
                  : `"${book}" is currently unavailable. Would you like to be notified when it's back?`,
                outputContexts: [
                  {
                    name: `${req.body.session}/contexts/awaiting_reservation_confirmation`,
                    lifespanCount: 5
                  }
                ]
            });
        }

        // ----------------------------------------------------
        // 3. User says YES — confirm reservation
        // ----------------------------------------------------
        case "ReservationConfirmIntent": {
            return res.json({
                fulfillmentText: `Great! Your reservation is confirmed. 🎉`
            });
        }

        // ----------------------------------------------------
        // 4. User says NO — stop flow
        // ----------------------------------------------------
        case "ReservationDeclineIntent": {
            return res.json({
                fulfillmentText: `No problem! Let me know if you want to search for another book.`
            });
        }

        default:
            return res.json({
                fulfillmentText: "I'm not sure how to help with that."
            });
    }
});

// Start server
app.listen(3000, () => console.log("Webhook is running on port 3000"));
