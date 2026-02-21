<!-- PROJECT HEADER -->
<div align="center">
  <img src="https://files.catbox.moe/1rjzor.jpeg" alt="WhatsApp Web API" width="600"/>

  # WhatsApp Web API
  **Advanced Baileys WhatsApp API Wrapper**

  [![NPM Version](https://img.shields.io/npm/v/@kelvdra/baileys?color=brightgreen&label=NPM)](https://www.npmjs.com/package/@kelvdra/baileys)
  [![Downloads](https://img.shields.io/npm/dw/@kelvdra/baileys?color=blue&label=Downloads)](https://www.npmjs.com/package/@kelvdra/baileys)
  [![License](https://img.shields.io/github/license/kelvdra/baileys?color=yellow)](./LICENSE)

  ---
  A modern and feature-rich WhatsApp Web API built on top of **Baileys** — 
  designed for automation, chatbots, and integration with any Node.js project.
</div>

---

## 📑 Table of Contents
- [⚡ Quick Start](#-quick-start)
- [📦 Installation](#-installation)
- [🔌 Connecting Account](#-connecting-account)
- [💡 Important Notes](#-important-notes-about-socket-config)
- [💾 Saving & Restoring Sessions](#-saving--restoring-sessions)
- [📡 Handling Events](#-handling-events)
- [🛠 Implementing a Data Store](#-implementing-a-data-store)
- [🔑 WhatsApp IDs](#-whatsapp-ids-explain)
- [✉️ Sending Messages](#-sending-messages)
    - [Non-Media Messages](#non-media-messages)
        - [Text Message](#text-message)
        - [Quote Message](#quote-message-works-with-all-types)
        - [Mention User](#mention-user-works-with-most-types)
        - [Mention Status](#mention-status)
        - [Result Poll From Newsletter](#result-poll-from-newsletter)
        - [SendAlbumMessage](#send-album-message)
        - [SendMessage Product Simple](#SendMessage-Product-Simple)
        - [SendMessage Carousel](#sendMessage-Carousel)
        - [Request Payment](#request-payment)
        - [Event Message](#event-message)
        - [Interactive Message with Native Flow](#Interactive-Message-with-Native-Flow)
        - [Interactive](#interactive)
        - [Forward Messages](#forward-messages)
        - [Location Message](#location-message)
        - [Contact Message](#contact-message)
        - [Reaction Message](#reaction-message)
        - [Pin Message](#pin-message)
        - [Keep Message](#keep-message)
        - [Poll Message](#poll-message)
    - [Sending with Link Preview](#sending-messages-with-link-previews)
- [🖼 Media Messages](#-media-messages)
    - [Gif Message](#gif-message)
        - [Video Message](#video-message)
        - [Audio Message](#audio-message)
        - [Image Message](#image-message)
        - [ViewOnce Message](#view-once-message)
- [✏️ Modify Messages](#-modify-messages)
- [📥 Downloading & Re-uploading Media](#-manipulating-media-messages)
- [📞 Call & Presence Handling](#-reject-call)
- [💬 Chat Modifications](#-modifying-chats)
- [🔍 User Queries](#-user-querys)
- [👤 Profile Management](#-change-profile)
- [👥 Group Management](#-groups)
- [🔒 Privacy Controls](#-privacy)
- [📢 Broadcast & Stories](#-broadcast-lists--stories)
- [🧩 Custom Functionality](#-writing-custom-functionality)

---

## ⚡ Quick Start

Example usage:

```bash
cd path/to/Baileys
npm install
node example.js
```

Or check the **[example.ts](Example/example.ts)** for a TypeScript version.

---

## 📦 Installation

**Stable version**
```bash
npm install @kelvdra/baileys
```

**Edge version** (latest features, may be unstable)
```bash
yarn add @kelvdra/baileys@latest
```

**Import into your code**
```javascript
import makeWASocket from "@kelvdra/baileys"
```

> ⚠️ **Tip:** Use the stable version for production environments.

---

## 🔌 Connecting Account

WhatsApp supports **multi-device API**, allowing Baileys to act as a secondary WhatsApp Web client.  
You can connect via **QR Code** or **Pairing Code**.

# How To Connect To Whatsapp
## With QR Code
```javascript
import makeWASocket from '@kelvdra/baileys'

const client = makeWASocket({
  browser: ['Ubuntu', 'Chrome', '20.00.1'],
  printQRInTerminal: true
})
```

## Connect With Number
```javascript
import makeWASocket, { useMultiFileAuthState } from '@kelvdra/baileys'

const client = makeWASocket({
  browser: ['Ubuntu', 'Chrome', '20.00.1'],
  printQRInTerminal: false,
  version: fetchLatestWAWebVersion()
  // Other options
});

const number = "628XXXXX";
const code = await client.requestPairingCode(number.trim) /* Use : (number, "YYYYYYYY") for custom-pairing */

console.log("Ur pairing code : " + code)
```

## 💡 Important Notes About Socket Config

### 📌 Cache Group Metadata
```javascript
const groupCache = new NodeCache({ stdTTL: 5 * 60, useClones: false });

const sock = makeWASocket({
    cachedGroupMetadata: async (jid) => groupCache.get(jid)
});
```

### 🔄 Improve Retry & Poll Decryption
```javascript
const sock = makeWASocket({
    getMessage: async (key) => await getMessageFromStore(key)
});
```

### 📱 Receive Notifications in WhatsApp App
```javascript
const sock = makeWASocket({
    markOnlineOnConnect: false
});
```

---

## 💾 Saving & Restoring Sessions

Avoid scanning QR every time:
```javascript
import makeWASocket from @kelvdra/baileys";
import { useMultiFileAuthState } from "@kelvdra/baileys"

const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
const sock = makeWASocket({ auth: state });

sock.ev.on('creds.update', saveCreds);
```
> 💡 Recommended to store auth in a database for production.

---

## 📡 Handling Events

Listen to events using:
```javascript
sock.ev.on('messages.upsert', ({ messages }) => {
    console.log('got messages', messages);
});
```

### Example to Start

> [!NOTE]
> This example includes basic auth storage too

```javascript
import makeWASocket from "@kelvdra/baileys"
import { DisconnectReason, useMultiFileAuthState } from "@kelvdra/baileys"
import Boom from '@hapi/boom'

async function connectToWhatsApp () {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys')
    const sock = makeWASocket({
        // can provide additional config here
        auth: state,
        printQRInTerminal: true
    })
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if(connection === 'close') {
            const shouldReconnect = (lastDisconnect.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
            console.log('connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect)
            // reconnect if not logged out
            if(shouldReconnect) {
                connectToWhatsApp()
            }
        } else if(connection === 'open') {
            console.log('opened connection')
        }
    })
    sock.ev.on('messages.upsert', event => {
        for (const m of event.messages) {
            console.log(JSON.stringify(m, undefined, 2))

            console.log('replying to', m.key.remoteJid)
            await sock.sendMessage(m.key.remoteJid!, { text: 'Hello Word' })
        }
    })

    // to storage creds (session info) when it updates
    sock.ev.on('creds.update', saveCreds)
}
// run in main file
connectToWhatsApp()
```

> [!IMPORTANT]
> In `messages.upsert` it's recommended to use a loop like `for (const message of event.messages)` to handle all messages in array

### Decrypt Poll Votes

- By default poll votes are encrypted and handled in `messages.update`
- That's a simple example
```javascript
sock.ev.on('messages.update', event => {
    for(const { key, update } of event) {
        if(update.pollUpdates) {
            const pollCreation = await getMessage(key)
            if(pollCreation) {
                console.log(
                    'got poll update, aggregation: ',
                    getAggregateVotesInPollMessage({
                        message: pollCreation,
                        pollUpdates: update.pollUpdates,
                    })
                )
            }
        }
    }
})
```

- `getMessage` is a [store](#implementing-a-data-store) implementation (in your end)

### Summary of Events on First Connection

1. When you connect first time, `connection.update` will be fired requesting you to restart sock
2. Then, history messages will be received in `messaging.history-set`

## Implementing a Data Store

- Baileys does not come with a defacto storage for chats, contacts, or messages. However, a simple in-memory implementation has been provided. The store listens for chat updates, new messages, message updates, etc., to always have an up-to-date version of the data.

> [!IMPORTANT]
> I highly recommend building your own data store, as storing someone's entire chat history in memory is a terrible waste of RAM.

It can be used as follows:

```javascript
import makeWASocket from "@kelvdra/baileys"
import { makeInMemoryStore } from "@kelvdra/baileys"
// the store maintains the data of the WA connection in memory
// can be written out to a file & read from it
const store = makeInMemoryStore({ })
// can be read from a file
store.readFromFile('./baileys_store.json')
// saves the state to a file every 10s
setInterval(() => {
    store.writeToFile('./baileys_store.json')
}, 10_000)

const sock = makeWASocket({ })
// will listen from this socket
// the store can listen from a new socket once the current socket outlives its lifetime
store.bind(sock.ev)

sock.ev.on('chats.upsert', () => {
    // can use 'store.chats' however you want, even after the socket dies out
    // 'chats' => a KeyedDB instance
    console.log('got chats', store.chats.all())
})

sock.ev.on('contacts.upsert', () => {
    console.log('got contacts', Object.values(store.contacts))
})

```

The store also provides some simple functions such as `loadMessages` that utilize the store to speed up data retrieval.

## Whatsapp IDs Explain

- `id` is the WhatsApp ID, called `jid` too, of the person or group you're sending the message to.
    - It must be in the format ```[country code][phone number]@s.whatsapp.net```
            - Example for people: ```+19999999999@s.whatsapp.net```.
            - For groups, it must be in the format ``` 123456789-123345@g.us ```.
    - For broadcast lists, it's `[timestamp of creation]@broadcast`.
    - For stories, the ID is `status@broadcast`.

## Utility Functions

- `getContentType`, returns the content type for any message
- `getDevice`, returns the device from message
- `makeCacheableSignalKeyStore`, make auth store more fast
- `downloadContentFromMessage`, download content from any message

## Sending Messages

- Send all types of messages with a single function
    - **[Here](https://baileys.whiskeysockets.io/types/AnyMessageContent.html) you can see all message contents supported, like text message**
    - **[Here](https://baileys.whiskeysockets.io/types/MiscMessageGenerationOptions.html) you can see all options supported, like quote message**

    ```javascript
    const jid: string
    const content: AnyMessageContent
    const options: MiscMessageGenerationOptions

    sock.sendMessage(jid, content, options)
    ```

### Non-Media Messages


#### Text Message
```javascript
await sock.sendMessage(jid, { text: 'hello word' })
```

#### Quote Message (works with all types)
```javascript
await sock.sendMessage(jid, { text: 'hello word' }, { quoted: message })
```

#### Mention User (works with most types)
- @number is to mention in text, it's optional
```javascript
await sock.sendMessage(
    jid,
    {
        text: '@12345678901',
        mentions: ['12345678901@s.whatsapp.net']
    }
)
```

#### Mention Status
- [ jid ] If the Jid Group and Jid Private Chat are included in the JID list, try to make the JID group first starting from the Jid Private Chat or Jid Private Chat in the middle between the group Jid
```javascript
await sock.sendStatusMentions(
     {
        text: "Hello", // or image / video / audio ( url or buffer )
     },
     [
      "123456789123456789@g.us",
      "123456789@s.whatsapp.net",
      // Enter jid chat here
     ] 
)  
```

#### Result Poll From Newsletter
```javascript
await sock.sendMessage(
    jid,
    {
        pollResult: {
            name: "Text poll",
            votes: [["Options 1", 10], ["Options 2", 10]], // 10 For Fake Polling Count Results
        }
    }, { quoted : message }
)
```

#### Send Album Message
- url or buffer ( image or video ) 
```javascript
await sock.sendAlbumMessage(
    jid,
    [
       {
          image: { url: "https://example.jpg" }, // or buffer
          caption: "Hello World",
       },
       {
          video: { url: "https://example.mp4" }, // or buffer
          caption: "Hello World",
       },
    ],
    { 
       quoted : message, 
       delay : 2000 // number in seconds
    }
)

```

#### Request Payment
```javascript
- Example non media sticker
await sock.sendMessage(
    jid,
    {
        requestPayment: {      
           currency: "IDR",
           amount: "10000000",
           from: "123456@s.whatsapp.net",
           note: "Hai Guys",
           background: { ...background of the message }
        }
    },
    { quoted : message }
)

- with media sticker buffer
await sock.sendMessage(
    jid,
    {
        requestPayment: {      
           currency: "IDR",
           amount: "10000000",
           from: "123456@s.whatsapp.net",
           sticker: Buffer,
           background: { ...background of the message }
        }
    },
    { quoted : message }
)

- with media sticker url
await sock.sendMessage(
    jid,
    {
        requestPayment: {      
           currency: "IDR",
           amount: "10000000",
           from: "123456@s.whatsapp.net",
           sticker: { url: Sticker Url },
           background: { ...background of the message }
        }
    },
    { quoted : message }
)
```

#### Event Message
```javascript
await sock.sendMessage(
   jid, 
   { 
       event: {
           isCanceled: false, // or true for cancel event 
           name: "Name Event", 
           description: "Description Event",
           location: { 
               degressLatitude: -0, 
               degressLongitude: - 0 
           },
           link: Call Link,
           startTime: m.messageTimestamp.low,
           endTime: m.messageTimestamp.low + 86400, // 86400 is day in seconds
           extraGuestsAllowed: true // or false
       }
   },
   { quoted : message }
)
```

### SendMessage Product Simple
```javascript
conn.sendMessage(m.chat, {
                    productMessage: {
                        title: "tes",
                        description: "penis",
                        thumbnail: "https://example.png",
                        productId: "123456789",
                        retailerId: "TOKOKU",
                        url: "https://example.png",
                        body: "penis",
                        footer: "wabot",
                        buttons: [
                            {
                                name: "cta_url",
                                buttonParamsJson: JSON.stringify({
                                    display_text: "K",
                                    url: "google.com"
                                })
                            }
                        ]
                    }
                }, { quoted: m });
```
### SendMessage Carousel
```javascript
await sock.sendMessage(
    jid,
    {
        carouselMessage: {
            caption: "Klik Url",
            footer: "Powered By Hydra",
            cards: [
                // ✅ Card Mode Product
                {
                    headerTitle: "`</> Owner Bot </>`",
                    imageUrl: logo.thumb,
                    productTitle: "Premium Bot",
                    productDescription: "Dapatkan akses premium",
                    bodyText: "[Hydra]\n- Chat yang penting aja\n- Jangan telpon owner",
                    buttons: [
                        {
                            name: "cta_call",
                            params: { display_text: "Contact Owner", phone_number: "+6287784901856" }
                        }
                    ]
                },
                // ✅ Card Mode Gambar Biasa
                {
                    headerTitle: "`</> Bot Elaina </>`",
                    imageUrl: logo.thumb,
                    bodyText: "[Elaina AI]\n- Jangan spam bot\n- Jangan telpon bot",
                    buttons: [
                        {
                            name: "cta_url",
                            params: {
                                display_text: "Chat Bot",
                                url: "https://wa.me/6281918402014",
                                merchant_url: "https://wa.me/6281918402014"
                            }
                        }
                    ]
                }
            ]
        }
    },
    { quoted: m },
    conn
);
```

### Interactive Message with Native Flow
Send interactive messages with buttons, copy actions, and native flow features:

```javascript
await sock.sendMessage(jid, {    
    interactiveMessage: {      
        title: "Hello World",      
        footer: "telegram: @draa82",      
        image: { url: "https://example.com/image.jpg" },      
        nativeFlowMessage: {        
            messageParamsJson: JSON.stringify({          
                limited_time_offer: {            
                    text: "idk hummmm?",            
                    url: "t.me/draa82",            
                    copy_code: "kelvdra 1437",            
                    expiration_time: Date.now() * 999          
                },          
                bottom_sheet: {            
                    in_thread_buttons_limit: 2,            
                    divider_indices: [1, 2, 3, 4, 5, 999],            
                    list_title: "kelvdra",            
                    button_title: "kelvdra"          
                },          
                tap_target_configuration: {            
                    title: " X ",            
                    description: "bomboclard",            
                    canonical_url: "https://t.me/draa82",            
                    domain: "shop.example.com",            
                    button_index: 0          
                }        
            }),        
            buttons: [          
                {            
                    name: "single_select",            
                    buttonParamsJson: JSON.stringify({              
                        has_multiple_buttons: true            
                    })          
                },          
                {            
                    name: "call_permission_request",            
                    buttonParamsJson: JSON.stringify({              
                        has_multiple_buttons: true            
                    })          
                },          
                {            
                    name: "single_select",            
                    buttonParamsJson: JSON.stringify({              
                        title: "Hello World",              
                        sections: [                
                            {                  
                                title: "title",                  
                                highlight_label: "label",                  
                                rows: [                    
                                    {                      
                                        title: "@kelvdra",                      
                                        description: "love you",                      
                                        id: "row_2"                    
                                    }                  
                                ]                
                            }              
                        ],              
                        has_multiple_buttons: true            
                    })          
                },          
                {            
                    name: "cta_copy",            
                    buttonParamsJson: JSON.stringify({              
                        display_text: "copy code",              
                        id: "123456789",              
                        copy_code: "ABC123XYZ"            
                    })          
                }        
            ]      
        }    
    }  
}, { quoted: m });
```

#### Interactive
```javascript
- Example non header media
await sock.sendMessage(
    jid,
    {
        text: "Description Of Messages", //Additional information
        title: "Title Of Messages",
        subtitle: "Subtitle Message",
        footer: "Footer Messages",
        interactiveButtons: [
             {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                     display_text: "Display Button",
                     id: "ID"
                })
             },
             {
                name: "cta_url",
                buttonParamsJson: JSON.stringify({
                     display_text: "Display Button",
                     url: "https://www.example.com"
                })
             }
        ]
    },
  { quoted : message }
)

- Example with media
await sock.sendMessage(
    jid,
    {
        image: { url : "https://example.jpg" }, // Can buffer
        caption: "Description Of Messages", //Additional information
        title: "Title Of Messages",
        subtitle: "Subtile Message",
        footer: "Footer Messages",
        media: true,
        interactiveButtons: [
             {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                     display_text: "Display Button",
                     id: "ID"
                })
             },
             {
                name: "cta_url",
                buttonParamsJson: JSON.stringify({
                     display_text: "Display Button",
                     url: "https://www.example.com"
                })
             }
        ]
    },
  { quoted : message }
)

- Example with header product
await sock.sendMessage(
    jid,
    {
        product: {
            productImage: { url: "https://example.jpg }, //or buffer
            productImageCount: 1,
            title: "Title Product",
            description: "Description Product",
            priceAmount1000: 20000 * 1000,
            currencyCode: "IDR",
            retailerId: "Retail",
            url: "https://example.com",            
        },
        businessOwnerJid: "1234@s.whatsapp.net",
        caption: "Description Of Messages", //Additional information
        title: "Title Of Messages",
        footer: "Footer Messages",
        media: true,
        interactiveButtons: [
             {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                     display_text: "Display Button",
                     id: "ID"
                })
             },
             {
                name: "cta_url",
                buttonParamsJson: JSON.stringify({
                     display_text: "Display Button",
                     url: "https://www.example.com"
                })
             }
        ]
    },
  { quoted : message }
)
```

#### Forward Messages
- You need to have message object, can be retrieved from [store](#implementing-a-data-store) or use a [message](https://baileys.whiskeysockets.io/types/WAMessage.html) object
```javascript
const msg = getMessageFromStore() // implement this on your end
await sock.sendMessage(jid, { forward: msg }) // WA forward the message!
```

#### Location Message
```javascript
await sock.sendMessage(
    jid,
    {
        location: {
            degreesLatitude: 24.121231,
            degreesLongitude: 55.1121221
        }
    }
)
```
#### Contact Message
```javascript
const vcard = 'BEGIN:VCARD\n' // metadata of the contact card
            + 'VERSION:3.0\n'
            + 'FN:Jeff Singh\n' // full name
            + 'ORG:Ashoka Uni;\n' // the organization of the contact
            + 'TEL;type=CELL;type=VOICE;waid=911234567890:+91 12345 67890\n' // WhatsApp ID + phone number
            + 'END:VCARD'

await sock.sendMessage(
    id,
    {
        contacts: {
            displayName: 'Jeff',
            contacts: [{ vcard }]
        }
    }
)
```

#### Reaction Message
- You need to pass the key of message, you can retrieve from [store](#implementing-a-data-store) or use a [key](https://baileys.whiskeysockets.io/types/WAMessageKey.html) object
```javascript
await sock.sendMessage(
    jid,
    {
        react: {
            text: '💖', // use an empty string to remove the reaction
            key: message.key
        }
    }
)
```

#### Pin Message
- You need to pass the key of message, you can retrieve from [store](#implementing-a-data-store) or use a [key](https://baileys.whiskeysockets.io/types/WAMessageKey.html) object

- Time can be:

| Time  | Seconds        |
|-------|----------------|
| 24h    | 86.400        |
| 7d     | 604.800       |
| 30d    | 2.592.000     |

```javascript
await sock.sendMessage(
    jid,
    {
        pin: {
            type: 1, // 0 to remove
            time: 86400
            key: message.key
        }
    }
)
```

#### Keep Message
- You need to pass the key of message, you can retrieve from [store](#implementing-a-data-store) or use a [key](https://baileys.whiskeysockets.io/types/WAMessageKey.html) object

- Time can be:

| Time  | Seconds        |
|-------|----------------|
| 24h    | 86.400        |
| 7d     | 604.800       |
| 30d    | 2.592.000     |

```javascript
await sock.sendMessage(
    jid,
    {
        keep: message.key,
        type: 1, // 2 to unpin
        time: 86400    
    }
)
```

#### Poll Message
```javascript
await sock.sendMessage(
    jid,
    {
        poll: {
            name: 'My Poll',
            values: ['Option 1', 'Option 2', ...],
            selectableCount: 1,
            toAnnouncementGroup: false // or true
        }
    }
)
```

### Sending Messages with Link Previews

1. By default, wa does not have link generation when sent from the web
2. Baileys has a function to generate the content for these link previews
3. To enable this function's usage, add `link-preview-js` as a dependency to your project with `yarn add link-preview-js`
4. Send a link:
```javascript
await sock.sendMessage(
    jid,
    {
        text: 'Hi, this was sent using https://github.com/whiskeysockets/baileys'
    }
)
```

### Media Messages

Sending media (video, stickers, images) is easier & more efficient than ever.

> [!NOTE]
> In media messages, you can pass `{ stream: Stream }` or `{ url: Url }` or `Buffer` directly, you can see more [here](https://baileys.whiskeysockets.io/types/WAMediaUpload.html)

- When specifying a media url, Baileys never loads the entire buffer into memory; it even encrypts the media as a readable stream.

> [!TIP]
> It's recommended to use Stream or Url to save memory

#### Gif Message
- Whatsapp doesn't support `.gif` files, that's why we send gifs as common `.mp4` video with `gifPlayback` flag
```javascript
await sock.sendMessage(
    jid,
    {
        video: fs.readFileSync('Media/ma_gif.mp4'),
        caption: 'hello word',
        gifPlayback: true
    }
)
```

#### Video Message
```javascript
await sock.sendMessage(
    id,
    {
        video: {
            url: './Media/ma_gif.mp4'
        },
        caption: 'hello word',
            ptv: false // if set to true, will send as a `video note`
    }
)
```

#### Audio Message
- To audio message work in all devices you need to convert with some tool like `ffmpeg` with this flags:
    ```bash
        codec: libopus //ogg file
        ac: 1 //one channel
        avoid_negative_ts
        make_zero
    ```
    - Example:
    ```bash
    ffmpeg -i input.mp4 -avoid_negative_ts make_zero -ac 1 output.ogg
    ```
```javascript
await sock.sendMessage(
    jid,
    {
        audio: {
            url: './Media/audio.mp3'
        },
        mimetype: 'audio/mp4'
    }
)
```

#### Image Message
```javascript
await sock.sendMessage(
    id,
    {
        image: {
            url: './Media/ma_img.png'
        },
        caption: 'hello word'
    }
)
```

#### View Once Message

- You can send all messages above as `viewOnce`, you only need to pass `viewOnce: true` in content object

```javascript
await sock.sendMessage(
    id,
    {
        image: {
            url: './Media/ma_img.png'
        },
        viewOnce: true, //works with video, audio too
        caption: 'hello word'
    }
)
```

## Modify Messages

### Deleting Messages (for everyone)

```javascript
const msg = await sock.sendMessage(jid, { text: 'hello word' })
await sock.sendMessage(jid, { delete: msg.key })
```

**Note:** deleting for oneself is supported via `chatModify`, see in [this section](#modifying-chats)

### Editing Messages

- You can pass all editable contents here
```javascript
await sock.sendMessage(jid, {
      text: 'updated text goes here',
      edit: response.key,
    });
```

## Manipulating Media Messages

### Thumbnail in Media Messages
- For media messages, the thumbnail can be generated automatically for images & stickers provided you add `jimp` or `sharp` as a dependency in your project using `yarn add jimp` or `yarn add sharp`.
- Thumbnails for videos can also be generated automatically, though, you need to have `ffmpeg` installed on your system.

### Downloading Media Messages

If you want to save the media you received
```javascript
import { createWriteStream } from 'fs'
import { downloadMediaMessage, getContentType } from "@kelvdra/baileys"

sock.ev.on('messages.upsert', async ({ [m] }) => {
    if (!m.message) return // if there is no text or media message
    const messageType = getContentType(m) // get what type of message it is (text, image, video...)

    // if the message is an image
    if (messageType === 'imageMessage') {
        // download the message
        const stream = await downloadMediaMessage(
            m,
            'stream', // can be 'buffer' too
            { },
            {
                logger,
                // pass this so that baileys can request a reupload of media
                // that has been deleted
                reuploadRequest: sock.updateMediaMessage
            }
        )
        // save to file
        const writeStream = createWriteStream('./my-download.jpeg')
        stream.pipe(writeStream)
    }
}
```

### Re-upload Media Message to Whatsapp

- WhatsApp automatically removes old media from their servers. For the device to access said media -- a re-upload is required by another device that has it. This can be accomplished using:
```javascript
await sock.updateMediaMessage(msg)
```

## Reject Call

- You can obtain `callId` and `callFrom` from `call` event

```javascript
await sock.rejectCall(callId, callFrom)
```

## Send States in Chat

### Reading Messages
- A set of message [keys](https://baileys.whiskeysockets.io/types/WAMessageKey.html) must be explicitly marked read now.
- You cannot mark an entire 'chat' read as it were with Baileys Web.
This means you have to keep track of unread messages.

```javascript
const key: WAMessageKey
// can pass multiple keys to read multiple messages as well
await sock.readMessages([key])
```

The message ID is the unique identifier of the message that you are marking as read.
On a `WAMessage`, the `messageID` can be accessed using ```messageID = message.key.id```.

### Update Presence

- ``` presence ``` can be one of [these](https://baileys.whiskeysockets.io/types/WAPresence.html)
- The presence expires after about 10 seconds.
- This lets the person/group with `jid` know whether you're online, offline, typing etc.

```javascript
await sock.sendPresenceUpdate('available', jid)
```

> [!NOTE]
> If a desktop client is active, WA doesn't send push notifications to the device. If you would like to receive said notifications -- mark your Baileys client offline using `sock.sendPresenceUpdate('unavailable')`

## Modifying Chats

WA uses an encrypted form of communication to send chat/app updates. This has been implemented mostly and you can send the following updates:

> [!IMPORTANT]
> If you mess up one of your updates, WA can log you out of all your devices and you'll have to log in again.

### Archive a Chat
```javascript
const lastMsgInChat = await getLastMessageInChat(jid) // implement this on your end
await sock.chatModify({ archive: true, lastMessages: [lastMsgInChat] }, jid)
```
### Mute/Unmute a Chat

- Supported times:

| Time  | Miliseconds     |
|-------|-----------------|
| Remove | null           |
| 8h     | 86.400.000     |
| 7d     | 604.800.000    |

```javascript
// mute for 8 hours
await sock.chatModify({ mute: 8 * 60 * 60 * 1000 }, jid)
// unmute
await sock.chatModify({ mute: null }, jid)
```
### Mark a Chat Read/Unread
```javascript
const lastMsgInChat = await getLastMessageInChat(jid) // implement this on your end
// mark it unread
await sock.chatModify({ markRead: false, lastMessages: [lastMsgInChat] }, jid)
```

### Delete a Message for Me
```javascript
await sock.chatModify(
    {
        clear: {
            messages: [
                {
                    id: 'ATWYHDNNWU81732J',
                    fromMe: true,
                    timestamp: '1654823909'
                }
            ]
        }
    },
    jid
)

```
### Delete a Chat
```javascript
const lastMsgInChat = await getLastMessageInChat(jid) // implement this on your end
await sock.chatModify({
        delete: true,
        lastMessages: [
            {
                key: lastMsgInChat.key,
                messageTimestamp: lastMsgInChat.messageTimestamp
            }
        ]
    },
    jid
)
```
### Pin/Unpin a Chat
```javascript
await sock.chatModify({
        pin: true // or `false` to unpin
    },
    jid
)
```
### Star/Unstar a Message
```javascript
await sock.chatModify({
        star: {
            messages: [
                {
                    id: 'messageID',
                    fromMe: true // or `false`
                }
            ],
            star: true // - true: Star Message; false: Unstar Message
        }
    },
    jid
)
```

### Disappearing Messages

- Ephemeral can be:

| Time  | Seconds        |
|-------|----------------|
| Remove | 0          |
| 24h    | 86.400     |
| 7d     | 604.800    |
| 90d    | 7.776.000  |

- You need to pass in **Seconds**, default is 7 days

```javascript
// turn on disappearing messages
await sock.sendMessage(
    jid,
    // this is 1 week in seconds -- how long you want messages to appear for
    { disappearingMessagesInChat: WA_DEFAULT_EPHEMERAL }
)

// will send as a disappearing message
await sock.sendMessage(jid, { text: 'hello' }, { ephemeralExpiration: WA_DEFAULT_EPHEMERAL })

// turn off disappearing messages
await sock.sendMessage(
    jid,
    { disappearingMessagesInChat: false }
)
```

## User Querys

### Check If ID Exists in Whatsapp
```javascript
const [result] = await sock.onWhatsApp(jid)
if (result.exists) console.log (`${jid} exists on WhatsApp, as jid: ${result.jid}`)
```

### Query Chat History (groups too)

- You need to have oldest message in chat
```javascript
const msg = await getOldestMessageInChat(jid)
await sock.fetchMessageHistory(
    50, //quantity (max: 50 per query)
    msg.key,
    msg.messageTimestamp
)
```
- Messages will be received in `messaging.history-set` event

### Fetch User Lid
```javascript
const jid = "123456789@s.whatsapp.net"
const lid = await sock.fetchUserLid(jid)
console.log('user lid: ' + lid)
```

### Fetch Status
```javascript
const status = await sock.fetchStatus(jid)
console.log('status: ' + status)
```

### Fetch Profile Picture (groups too)
- To get the display picture of some person/group/newsletter
```javascript
// for low res picture
const ppUrl = await sock.profilePictureUrl(jid)
console.log(ppUrl)

// for high res picture
const ppUrl = await sock.profilePictureUrl(jid, 'image')
```

### Fetch Bussines Profile (such as description or category)
```javascript
const profile = await sock.getBusinessProfile(jid)
console.log('business description: ' + profile.description + ', category: ' + profile.category)
```

### Fetch Someone's Presence (if they're typing or online)
```javascript
// the presence update is fetched and called here
sock.ev.on('presence.update', console.log)

// request updates for a chat
await sock.presenceSubscribe(jid)
```

## Change Profile

### Change Profile Status
```javascript
await sock.updateProfileStatus('Hello World!')
```
### Change Profile Name
```javascript
await sock.updateProfileName('My name')
```
### Change Display Picture (groups too)
- To change your display picture or a group's

> [!NOTE]
> Like media messages, you can pass `{ stream: Stream }` or `{ url: Url }` or `Buffer` directly, you can see more [here](https://baileys.whiskeysockets.io/types/WAMediaUpload.html)

```javascript
await sock.updateProfilePicture(jid, { url: './new-profile-picture.jpeg' })
```
### Remove display picture (groups too)
```javascript
await sock.removeProfilePicture(jid)
```

## Groups

- To change group properties you need to be admin

### Create a Group
```javascript
// title & participants
const group = await sock.groupCreate('My Fab Group', ['1234@s.whatsapp.net', '4564@s.whatsapp.net'])
console.log('created group with id: ' + group.gid)
await sock.sendMessage(group.id, { text: 'hello there' }) // say hello to everyone on the group
```
### Add/Remove or Demote/Promote
```javascript
// id & people to add to the group (will throw error if it fails)
await sock.groupParticipantsUpdate(
    jid,
    ['abcd@s.whatsapp.net', 'efgh@s.whatsapp.net'],
    'add' // replace this parameter with 'remove' or 'demote' or 'promote'
)
```
### Change Subject (name)
```javascript
await sock.groupUpdateSubject(jid, 'New Subject!')
```
### Change Description
```javascript
await sock.groupUpdateDescription(jid, 'New Description!')
```
### Change Settings
```javascript
// only allow admins to send messages
await sock.groupSettingUpdate(jid, 'announcement')
// allow everyone to send messages
await sock.groupSettingUpdate(jid, 'not_announcement')
// allow everyone to modify the group's settings -- like display picture etc.
await sock.groupSettingUpdate(jid, 'unlocked')
// only allow admins to modify the group's settings
await sock.groupSettingUpdate(jid, 'locked')
```
### Leave a Group
```javascript
// will throw error if it fails
await sock.groupLeave(jid)
```
### Get Invite Code
- To create link with code use `'https://chat.whatsapp.com/' + code`
```javascript
const code = await sock.groupInviteCode(jid)
console.log('group code: ' + code)
```
### Revoke Invite Code
```javascript
const code = await sock.groupRevokeInvite(jid)
console.log('New group code: ' + code)
```
### Join Using Invitation Code
- Code can't have `https://chat.whatsapp.com/`, only code
```javascript
const response = await sock.groupAcceptInvite(code)
console.log('joined to: ' + response)
```
### Get Group Info by Invite Code
```javascript
const response = await sock.groupGetInviteInfo(code)
console.log('group information: ' + response)
```
### Query Metadata (participants, name, description...)
```javascript
const metadata = await sock.groupMetadata(jid)
console.log(metadata.id + ', title: ' + metadata.subject + ', description: ' + metadata.desc)
```
### Join using `groupInviteMessage`
```javascript
const response = await sock.groupAcceptInviteV4(jid, groupInviteMessage)
console.log('joined to: ' + response)
```
### Get Request Join List
```javascript
const response = await sock.groupRequestParticipantsList(jid)
console.log(response)
```
### Approve/Reject Request Join
```javascript
const response = await sock.groupRequestParticipantsUpdate(
    jid, // group id
    ['abcd@s.whatsapp.net', 'efgh@s.whatsapp.net'],
    'approve' // or 'reject'
)
console.log(response)
```
### Get All Participating Groups Metadata
```javascript
const response = await sock.groupFetchAllParticipating()
console.log(response)
```
### Toggle Ephemeral

- Ephemeral can be:

| Time  | Seconds        |
|-------|----------------|
| Remove | 0          |
| 24h    | 86.400     |
| 7d     | 604.800    |
| 90d    | 7.776.000  |

```javascript
await sock.groupToggleEphemeral(jid, 86400)
```

### Change Add Mode
```javascript
await sock.groupMemberAddMode(
    jid,
    'all_member_add' // or 'admin_add'
)
```

## Privacy

### Block/Unblock User
```javascript
await sock.updateBlockStatus(jid, 'block') // Block user
await sock.updateBlockStatus(jid, 'unblock') // Unblock user
```
### Get Privacy Settings
```javascript
const privacySettings = await sock.fetchPrivacySettings(true)
console.log('privacy settings: ' + privacySettings)
```
### Get BlockList
```javascript
const response = await sock.fetchBlocklist()
console.log(response)
```
### Update LastSeen Privacy
```javascript
const value = 'all' // 'contacts' | 'contact_blacklist' | 'none'
await sock.updateLastSeenPrivacy(value)
```
### Update Online Privacy
```javascript
const value = 'all' // 'match_last_seen'
await sock.updateOnlinePrivacy(value)
```
### Update Profile Picture Privacy
```javascript
const value = 'all' // 'contacts' | 'contact_blacklist' | 'none'
await sock.updateProfilePicturePrivacy(value)
```
### Update Status Privacy
```javascript
const value = 'all' // 'contacts' | 'contact_blacklist' | 'none'
await sock.updateStatusPrivacy(value)
```
### Update Read Receipts Privacy
```javascript
const value = 'all' // 'none'
await sock.updateReadReceiptsPrivacy(value)
```
### Update Groups Add Privacy
```javascript
const value = 'all' // 'contacts' | 'contact_blacklist'
await sock.updateGroupsAddPrivacy(value)
```
### Update Default Disappearing Mode

- Like [this](#disappearing-messages), ephemeral can be:

| Time  | Seconds        |
|-------|----------------|
| Remove | 0          |
| 24h    | 86.400     |
| 7d     | 604.800    |
| 90d    | 7.776.000  |

```javascript
const ephemeral = 86400
await sock.updateDefaultDisappearingMode(ephemeral)
```

## Broadcast Lists & Stories

### Send Broadcast & Stories
- Messages can be sent to broadcasts & stories. You need to add the following message options in sendMessage, like this:
```javascript
await sock.sendMessage(
    jid,
    {
        image: {
            url: url
        },
        caption: caption
    },
    {
        backgroundColor: backgroundColor,
        font: font,
        statusJidList: statusJidList,
        broadcast: true
    }
)
```
- Message body can be a `extendedTextMessage` or `imageMessage` or `videoMessage` or `voiceMessage`, see [here](https://baileys.whiskeysockets.io/types/AnyRegularMessageContent.html)
- You can add `backgroundColor` and other options in the message options, see [here](https://baileys.whiskeysockets.io/types/MiscMessageGenerationOptions.html)
- `broadcast: true` enables broadcast mode
- `statusJidList`: a list of people that you can get which you need to provide, which are the people who will get this status message.

- You can send messages to broadcast lists the same way you send messages to groups & individual chats.
- Right now, WA Web does not support creating broadcast lists, but you can still delete them.
- Broadcast IDs are in the format `12345678@broadcast`
### Query a Broadcast List's Recipients & Name
```javascript
const bList = await sock.getBroadcastListInfo('1234@broadcast')
console.log (`list name: ${bList.name}, recps: ${bList.recipients}`)
```

## Writing Custom Functionality
Baileys is written with custom functionality in mind. Instead of forking the project & re-writing the internals, you can simply write your own extensions.

### Enabling Debug Level in Baileys Logs
First, enable the logging of unhandled messages from WhatsApp by setting:
```javascript
const sock = makeWASocket({
    logger: P({ level: 'debug' }),
})
```
This will enable you to see all sorts of messages WhatsApp sends in the console.

### How Whatsapp Communicate With Us

> [!TIP]
> If you want to learn whatsapp protocol, we recommend to study about Libsignal Protocol and Noise Protocol

- **Example:** Functionality to track the battery percentage of your phone. You enable logging and you'll see a message about your battery pop up in the console:
    ```
    {
        "level": 10,
        "fromMe": false,
        "frame": {
            "tag": "ib",
            "attrs": {
                "from": "@s.whatsapp.net"
            },
            "content": [
                {
                    "tag": "edge_routing",
                    "attrs": {},
                    "content": [
                        {
                            "tag": "routing_info",
                            "attrs": {},
                            "content": {
                                "type": "Buffer",
                                "data": [8,2,8,5]
                            }
                        }
                    ]
                }
            ]
        },
        "msg":"communication"
    }
    ```

The `'frame'` is what the message received is, it has three components:
- `tag` -- what this frame is about (eg. message will have 'message')
- `attrs` -- a string key-value pair with some metadata (contains ID of the message usually)
- `content` -- the actual data (eg. a message node will have the actual message content in it)
- read more about this format [here](/src/WABinary/readme.md)

### Register a Callback for Websocket Events

> [!TIP]
> Recommended to see `onMessageReceived` function in `socket.ts` file to understand how websockets events are fired

```javascript
// for any message with tag 'edge_routing'
sock.ws.on('CB:edge_routing', (node: BinaryNode) => { })

// for any message with tag 'edge_routing' and id attribute = abcd
sock.ws.on('CB:edge_routing,id:abcd', (node: BinaryNode) => { })

// for any message with tag 'edge_routing', id attribute = abcd & first content node routing_info
sock.ws.on('CB:edge_routing,id:abcd,routing_info', (node: BinaryNode) => { })
```

> [!NOTE]
> Also, this repo is now licenced under GPL 3 since it uses [libsignal-node](https://git.questbook.io/backend/service-coderunner/-/merge_requests/1)
