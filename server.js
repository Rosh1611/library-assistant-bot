const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

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
  "Herman Melville": [
    "Moby-Dick"
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
  "Robert Kiyosaki": [
    "Rich Dad Poor Dad"
  ],
  "Stephen Covey": [
    "The 7 Habits of Highly Effective People"
  ],
  "Mark Manson": [
    "The Subtle Art of Not Giving a F*ck"
  ],
  "Agatha Christie": [
    "The Mysterious Affair at Styles",
    "The Secret Adversary",
    "Murder on the Orient Express",
    "Nemesis",
    "Sleeping Murder"
  ]
};

const bookAvailability = {
  // J.K. Rowling Books
  "Harry Potter and the Sorcerer’s Stone": true,
  "Harry Potter and the Chamber of Secrets": false,
  "Harry Potter and the Prisoner of Azkaban": true,
  "Harry Potter and the Goblet of Fire": true,
  "Harry Potter and the Order of the Phoenix": true,
  "Harry Potter and the Half-Blood Prince": false,
  "Harry Potter and the Deathly Hallows": true,

  // Yann Martel Books
  "Life of Pi": true,

  // Markus Zusak Books
  "The Book Thief": true,

  // J.R.R. Tolkien Books
  "The Hobbit": true,
  "The Lord of the Rings": false,
  "The Fellowship of the Ring": true,
  "The Two Towers": true,
  "The Return of the King": true,

  // Harper Lee Books
  "To Kill a Mockingbird": true,

  // Jane Austen Books
  "Pride and Prejudice": true,

  // George Orwell Books
  "1984": true,

  // Herman Melville Books
  "Moby-Dick": false,

  // Paulo Coelho Books
  "The Alchemist": true,

  // Suzanne Collins Books
  "The Hunger Games": true,
  "Catching Fire": true,
  "Mockingjay": true,

  // John Green Books
  "The Fault in Our Stars": true,

  // Dan Brown Books
  "The Da Vinci Code": false,

  // James Clear Books
  "Atomic Habits": true,

  // Robert Kiyosaki Books
  "Rich Dad Poor Dad": true,

  // Stephen Covey Books
  "The 7 Habits of Highly Effective People": true,

  // Mark Manson Books
  "The Subtle Art of Not Giving a F*ck": true,

  // Agatha Christie Books
  "The Mysterious Affair at Styles": true,
  "The Secret Adversary": true,
  "Murder on the Orient Express": true,
  "Nemesis": false,
  "Sleeping Murder": true
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
            fulfillmentText: `Sorry, I don't have books listed for ${author}.`
        });
    }

    const list = authors[author].map((b, i) => `${i + 1}. ${b}`).join("\n");

    return res.json({
        fulfillmentMessages: [
            {
                text: {
                    text: [`Here are the books by ${author}:`]
                }
            },
            {
                payload: {
                    richContent: [
                        [
                            {
                                type: "list",
                                title: `Books by ${author}`,
                                subtitle: authors[author].map((b, i) => `${i + 1}. ${b}`).join(", ")
                            }
                        ]
                    ]
                }
            },
            {
                text: {
                    text: ["Which one would you like to reserve?"]
                }
            }
        ],
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
        case "Search Book For Reservation": {
            const book = req.body.queryResult.parameters.book_title;

            // Check availability in the mock database
            if (!bookAvailability[book]) {
                return res.json({
                    fulfillmentText: `I couldn't find availability info for "${book}".`
                });
            }

            const available = bookAvailability[book];

            if (available) {
                return res.json({
                    fulfillmentText: `Good news! "${book}" is available. Please provide your Library Card Number to continue with the reservation.`,
                    outputContexts: [
                        {
                            name: `${req.body.session}/contexts/reservation_need_user_id`,
                            lifespanCount: 5
                        }
                    ]
                });
            } else {
                return res.json({
                    fulfillmentText: `Unfortunately, "${book}" is currently checked out. Would you like to be added to the waitlist?`,
                    outputContexts: [
                        {
                            name: `${req.body.session}/contexts/reservation_offer_waitlist`,
                            lifespanCount: 5
                        }
                    ]
                });
            }
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
