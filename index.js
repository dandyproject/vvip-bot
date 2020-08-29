
const fs = require("fs"); 
const moment = require("moment");
const qrcode = require("qrcode-terminal"); 
const { Client, MessageMedia } = require("whatsapp-web.js"); 
const mqtt = require("mqtt"); 
const listen = mqtt.connect("mqtt://test.mosquitto.org"); 
const fetch = require("node-fetch"); 
const puppeteer = require("puppeteer"); 
const cheerio = require("cheerio");
const SESSION_FILE_PATH = "./session.json";
// file is included here
let sessionCfg;
if (fs.existsSync(SESSION_FILE_PATH)) {
  sessionCfg = require(SESSION_FILE_PATH);
}
client = new Client({	  
    
	     puppeteer: {
        executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
        headless: true,
		args: [
      "--log-level=3", // fatal only
   
      "--no-default-browser-check",
      "--disable-infobars",
      "--disable-web-security",
      "--disable-site-isolation-trials",
      "--no-experiments",
      "--ignore-gpu-blacklist",
      "--ignore-certificate-errors",
      "--ignore-certificate-errors-spki-list",
    
      "--disable-extensions",
      "--disable-default-apps",
      "--enable-features=NetworkService",
      "--disable-setuid-sandbox",
      "--no-sandbox",
    
      "--no-first-run",
      "--no-zygote"
    ]
		
    },	      
    session: sessionCfg
});
// You can use an existing session and avoid scanning a QR code by adding a "session" object to the client options.

client.initialize();

// ======================= Begin initialize WAbot

client.on("qr", qr => {
  // NOTE: This event will not be fired if a session is specified.
  qrcode.generate(qr, {
    small: true
  });
  console.log(`[ ${moment().format("HH:mm:ss")} ] Please Scan QR with app!`);
});

client.on("authenticated", session => {
  console.log(`[ ${moment().format("HH:mm:ss")} ] Authenticated Success!`);
  // console.log(session);
  sessionCfg = session;
  fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function(err) {
    if (err) {
      console.error(err);
    }
  });
});

client.on("auth_failure", msg => {
  // Fired if session restore was unsuccessfull
  console.log(
    `[ ${moment().format("HH:mm:ss")} ] AUTHENTICATION FAILURE \n ${msg}`
  );
  fs.unlink("./session.json", function(err) {
    if (err) return console.log(err);
    console.log(
      `[ ${moment().format("HH:mm:ss")} ] Session Deleted, Please Restart!`
    );
    process.exit(1);
  });
});

client.on("ready", () => {
  console.log(`[ ${moment().format("HH:mm:ss")} ] Whatsapp bot ready!`);
});

// ======================= Begin initialize mqtt broker

listen.on("connect", () => {
  listen.subscribe("corona", function(err) {
    if (!err) {
      console.log(`[ ${moment().format("HH:mm:ss")} ] Mqtt topic subscribed!`);
    }
  });
});

// ======================= WaBot Listen on Event

client.on("message_create", msg => {
  // Fired on all message creations, including your own
  if (msg.fromMe) {
    // do stuff here
  }
});

client.on("message_revoke_everyone", async (after, before) => {
  // Fired whenever a message is deleted by anyone (including you)
  // console.log(after); // message after it was deleted.
  if (before) {
    console.log(before.body); // message before it was deleted.
  }
});

client.on("message_revoke_me", async msg => {
  // Fired whenever a message is only deleted in your own view.
  // console.log(msg.body); // message before it was deleted.
});

client.on("message_ack", (msg, ack) => {
  /*
        == ACK VALUES ==
        ACK_ERROR: -1
        ACK_PENDING: 0
        ACK_SERVER: 1
        ACK_DEVICE: 2
        ACK_READ: 3
        ACK_PLAYED: 4
    */

  if (ack == 3) {
    // The message was read
  }
});
client.on('group_join', async (notification) => {
    // User has joined or been added to the group. 
    console.log('join', notification);
    const botno = notification.chatId.split('@')[0];
    let number = await notification.id.remote;
    client.sendMessage(number, `🅆🄴🄻🄲🄾🄼🄴 🄽🄴🅆🄼🄴🄼

*New member intro!*
●Nama  :
●Askot  :
●Umur :
●Nama Pacar :
●Jenis Kelamin :


Welcome Semoga Betah🥰


*TTD Asisten Grup*.`);
  
    const chats = await client.getChats();
    for (i in chats) {
        if (number == chats[i].id._serialized) {
            chat = chats[i];
        }
    }
    var participants = {};
    var admins = {};
    var i;
    for (let participant of chat.participants) {
        if (participant.id.user == botno) { continue; }
        //participants.push(participant.id.user);
        const contact = await client.getContactById(participant.id._serialized);
        participants[contact.pushname] = participant.id.user;
        // participant needs to send a message for it to be defined
        if (participant.isAdmin) {
            //admins.push(participant.id.user);
            admins[contact.pushname] = participant.id.user;
            client.sendMessage(participant.id._serialized, '*Notifikasi*: New Member bergabung ke grup.');
            const media = MessageMedia.fromFilePath('./test/test.pdf');
            client.sendMessage(participant.id._serialized, media);
        }
    }
    console.log('Group Details');
    console.log('Name: ', chat.name);
    console.log('Participants: ', participants);
    console.log('Admins: ', admins);
    //notification.reply('User joined.'); // sends message to self
});

client.on('group_leave', async (notification) => {
    // User has joined or been added to the group. 
    console.log('leave', notification);
    const botno = notification.chatId.split('@')[0];
    let number = await notification.id.remote;
    client.sendMessage(number, ` *Selamat Tinggal Sob*`);
  
    const chats = await client.getChats();
    for (i in chats) {
        if (number == chats[i].id._serialized) {
            chat = chats[i];
        }
    }
    var participants = {};
    var admins = {};
    var i;
    for (let participant of chat.participants) {
        if (participant.id.user == botno) { continue; }
        //participants.push(participant.id.user);
        const contact = await client.getContactById(participant.id._serialized);
        participants[contact.pushname] = participant.id.user;
        // participant needs to send a message for it to be defined
        if (participant.isAdmin) {
            //admins.push(participant.id.user);
            admins[contact.pushname] = participant.id.user;
            client.sendMessage(participant.id._serialized, '*Notifikasi*: Member keluar dari grup.');
            const media = MessageMedia.fromFilePath('./test/test.pdf');
            client.sendMessage(participant.id._serialized, media);
        }
    }
    console.log('Group Details');
    console.log('Name: ', chat.name);
    console.log('Participants: ', participants);
    console.log('Admins: ', admins);
    //notification.reply('User joined.'); // sends message to self
});

client.on("group_update", notification => {
  // Group picture, subject or description has been updated.
  console.log("update", notification);
});

client.on("disconnected", reason => {
  console.log("Client was logged out", reason);
});

// ======================= WaBot Listen on message

client.on("message", async msg => {
	// console.log('MESSAGE RECEIVED', msg);
    const chat = await msg.getChat();
    const users = await msg.getContact()
    const dariGC = msg['author']
    const dariPC = msg['from']
	console.log(` ${chat} 
	participant
	`)
const botTol = () => {
        msg.reply('*Akses Untuk Menu Admin Ditolak*')
        return
    }
    const botTol2 = () => {
        msg.reply(`*Akses ini hanya untuk di grup saja bro*`)
        return
    }

    if (msg.body.startsWith('subject ')) {
        if (chat.isGroup) {
            if (dariGC.replace('@c.us', '') == chat.owner.user) {
                let title = msg.body.slice(9)
                chat.setSubject(title)
            } else {
                botTol()
            }
        } else {
            botTol2()
        }
    } else if (msg.body === 'tagall') {
        const chat = await msg.getChat();

        let text = "";
        let mentions = [];

        for(let participant of chat.participants) {
            const contact = await client.getContactById(participant.id._serialized);

            mentions.push(contact);
			text += "Hae";
            text += `@${participant.id.user} `;
			text += "\n";
        }

        chat.sendMessage(text, { mentions });
    } else if (msg.body.startsWith('deskripsi ')) {
        if (chat.isGroup) {
            if (dariGC.replace('@c.us', '') == chat.owner.user ) {
                let title = msg.body.split("deskripsi ")[1]
                chat.setDescription(title)
            } else {
                botTol()
            }
        } else {
            botTol2()
        }
    } else if (msg.body.startsWith('promote ')) {
        if (chat.isGroup) {
            if (dariGC.replace('@c.us', '') == chat.owner.user) {
                const contact = await msg.getContact();
                const title = msg.mentionedIds[0]
                chat.promoteParticipants([`${title}`])
                chat.sendMessage(` @${title.replace('@c.us', '')} sekarang anda adalah admin sob 🔥`)
            } else {
                botTol()
            }
        } else {
            botTol2()
        }
    } else if (msg.body.startsWith('demote ')) {
        if (chat.isGroup) {
            if (dariGC.replace('@c.us', '') == chat.owner.user) {
                let title = msg.mentionedIds[0]
                chat.demoteParticipants([`${title}`])
            } else {
                botTol()
            }
        } else {
            botTol2()
        }
    } else if (msg.body.startsWith('add ')) {
        if (chat.isGroup) {
            if (dariGC.replace('@c.us', '')) {
                let title = msg.body.slice(5)
                if (title.indexOf('62') == -1) {
                    chat.addParticipants([`${title.replace('0', '62')}@c.us`])
                    msg.reply(`Selamat datang @${title} Jangan lupa baca deksripsi grup yah.`)
                } else {
                    msg.reply('Format nomor harus 0821xxxxxx')
                }
            } else {
                botTol()
            }
        } else {
            botTol2()
        }
    } else if (msg.body.startsWith('kick ')) {
        if (chat.isGroup) {
            if (dariGC.replace('@c.us', '') == chat.owner.user) {
                let title = msg.mentionedIds
                chat.removeParticipants([...title])
                // console.log([...title]);
            } else {
                botTol()
            }
        } else {
            botTol2()
        }
    } else if (msg.body == 'owner') {
        if (chat.isGroup) {
            msg.reply(JSON.stringify({
                owner: chat.owner.user
            }))
        } else {
            botTol2()
        }
    } 


  if (msg.type == "ciphertext") {
    // Send a new message as a reply to the current one
    msg.reply(":v.");
  }
  else if (msg.body == "Bot") {
    // Send a new message as a reply to the current one
    msg.reply("_Bot Aktif!_");
  }else if (msg.body.startsWith("anime")) {
var fs = require('fs');
var files = fs.readdirSync('./kwpin')

/* now files is an Array of the name of the files in the folder and you can pick a random name inside of that array */
var  gambar = files[Math.floor(Math.random() * files.length)] 
var yuli = fs.readFileSync(
        "./kwpin/"+ gambar,
        "base64"
      );
const media = new MessageMedia('image/jpg', yuli);

console.log(gambar);
client.sendMessage(media);
}
 else if (msg.body.startsWith("makeff ")) {
	 msg.reply("sebentarr.. kita proses dulu")
	  var h = msg.body.split("makeff ")[1];
	 var nama = h.split("] ")[1];
	 var kata1 = h.split("[")[1].split("]")[0];
	 	const { exec } = require("child_process");

  (async () => {
    const browser = await puppeteer.launch({
      headless: false,

    });
    const page = await browser.newPage();
    await page
      .goto("https://ephoto360.com/tao-banner-youtube-game-free-fire-online-635.html", {
        waitUntil: "networkidle2",
      })
      .then(async () => {
		  		await page.click("#radio0-radio-83d1c1baf4c44e72bacc6cb8fe1c92a0");
     await page.type("#text-1", kata1);
   
		  await page.type("#text-0", nama);
		await page.click("#submit");
		await new Promise(resolve => setTimeout(resolve, 10000));
        try {
         
          await page.waitForSelector(
            "#link-image"
          );
          const element = await page.$(
         "div.thumbnail > img"
          );
          const text = await (await element.getProperty("src")).jsonValue();
         console.log(text);

        exec('wget "' + text + '" -O mp4/glow.jpg', (error, stdout, stderr) => {
  const media = MessageMedia.fromFilePath('mp4/glow.jpg');

	chat.sendMessage(media);
	if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }

    console.log(`stdout: ${stdout}`);
});
          browser.close();
        } catch (error) {
          console.log(error);
       

        }
      })
      .catch((err) => {
        console.log(error);
    
      });
	 
	 
  })();
 }
 else if (msg.body.startsWith("glow ")) {
	 msg.reply("_Permintaan sedang diproses_ *Jangan dispam*")
	  var h = msg.body.split("glow ")[1];

	 	const { exec } = require("child_process");

  (async () => {
    const browser = await puppeteer.launch({
      headless: false,

    });
    const page = await browser.newPage();
    await page
      .goto("https://ephoto360.com/hieu-ung-tao-chu-ky-anh-sang-nhieu-mau-sac-686.html", {
        waitUntil: "networkidle2",
      })
      .then(async () => {
		  await page.type("#text-0", h);
		await page.click("#submit");
		await new Promise(resolve => setTimeout(resolve, 10000));
        try {
         
          await page.waitForSelector(
            "#link-image"
          );
          const element = await page.$(
         "div.thumbnail > img"
          );
          const text = await (await element.getProperty("src")).jsonValue();
         console.log(text);

        exec('wget "' + text + '" -O mp4/glow.jpg', (error, stdout, stderr) => {
  const media = MessageMedia.fromFilePath('mp4/glow.jpg');

	msg.reply(media);
	if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }

    console.log(`stdout: ${stdout}`);
});
          browser.close();
        } catch (error) {
          console.log(error);
       

        }
      })
      .catch((err) => {
        console.log(error);
    
      });
	 
	 
  })();
 }
 else if (msg.body.startsWith("triangle")) {
  msg.reply("_Permintaan sedang diproses_ *Jangan dispam*")
     var h = msg.body.split("trieangle ")[1];

    const { exec } = require("child_process");

  (async () => {
    const browser = await puppeteer.launch({
      headless: false,

    });
    const page = await browser.newPage();
    await page
      .goto("https://ephoto360.com/tao-logo-avatar-du-lich-phong-cach-den-trang-643.html", {
        waitUntil: "networkidle2",
      })
      .then(async () => {
      await page.type("#text-0", h);
    await page.click("#submit");
    await new Promise(resolve => setTimeout(resolve, 10000));
        try {
         
          await page.waitForSelector(
            "#link-image"
          );
          const element = await page.$(
         "div.thumbnail > img"
          );
          const text = await (await element.getProperty("src")).jsonValue();
         console.log(text);

        exec('wget "' + text + '" -O mp4/glow.jpg', (error, stdout, stderr) => {
  const media = MessageMedia.fromFilePath('mp4/glow.jpg');

  msg.reply(media);
  if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }

    console.log(`stdout: ${stdout}`);
});
          browser.close();
        } catch (error) {
          console.log(error);
       

        }
      })
      .catch((err) => {
        console.log(error);
    
      });
   
   
  })();
 }
 else if (msg.body.startsWith("art ")) {
   msg.reply("_Permintaan sedang diproses_ *Jangan dispam*")
    var h = msg.body.split("art ")[1];

    const { exec } = require("child_process");

  (async () => {
    const browser = await puppeteer.launch({
      headless: false,

    });
    const page = await browser.newPage();
    await page
      .goto("https://ephoto360.com/hieu-ung-chu/tao-hieu-ung-chu-nghe-thuat-tren-tuong-72.html", {
        waitUntil: "networkidle2",
      })
      .then(async () => {
      await page.type("#text-0", h);
    await page.click("#submit");
    await new Promise(resolve => setTimeout(resolve, 10000));
        try {
         
          await page.waitForSelector(
            "#link-image"
          );
          const element = await page.$(
         "div.thumbnail > img"
          );
          const text = await (await element.getProperty("src")).jsonValue();
         console.log(text);

        exec('wget "' + text + '" -O mp4/glow.jpg', (error, stdout, stderr) => {
  const media = MessageMedia.fromFilePath('mp4/glow.jpg');

  msg.reply(media);
  if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }

    console.log(`stdout: ${stdout}`);
});
          browser.close();
        } catch (error) {
          console.log(error);
       

        }
      })
      .catch((err) => {
        console.log(error);
    
      });
   
   
  })();
 }
 else if (msg.body.startsWith("galaxy ")) {
   msg.reply("_Permintaan sedang diproses_ *Jangan di Spam*")
    var h = msg.body.split("galaxy ")[1];

    const { exec } = require("child_process");

  (async () => {
    const browser = await puppeteer.launch({
      headless: false,

    });
    const page = await browser.newPage();
    await page
      .goto("https://ephoto360.com/tao-chu-anh-sang-neon-phong-cach-galaxy-572.html", {
        waitUntil: "networkidle2",
      })
      .then(async () => {
      await page.type("#text-0", h);
    await page.click("#submit");
    await new Promise(resolve => setTimeout(resolve, 10000));
        try {
         
          await page.waitForSelector(
            "#link-image"
          );
          const element = await page.$(
         "div.thumbnail > img"
          );
          const text = await (await element.getProperty("src")).jsonValue();
         console.log(text);

        exec('wget "' + text + '" -O mp4/glow.jpg', (error, stdout, stderr) => {
  const media = MessageMedia.fromFilePath('mp4/glow.jpg');

  msg.reply(media);
  if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }

    console.log(`stdout: ${stdout}`);
});
          browser.close();
        } catch (error) {
          console.log(error);
       

        }
      })
      .catch((err) => {
        console.log(error);
    
      });
   
   
  })();
 }
  else if (msg.body.startsWith("fb ")) {
    msg.reply(`_Permintaan sedang diproses_`);
    let link = msg.body.split("fb ")[1];
	var namafile = "gue.mp4"
	const { exec } = require("child_process");
    const browser = await puppeteer.launch({
      headless: false,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
        "--window-size=1920x1080",
      ],
    });
    const page = await browser.newPage();
    await page
      .goto("https://id.savefrom.net/9-how-to-download-facebook-video.html", {
        waitUntil: "networkidle2",
      })
      .then(async () => {
        await page.type("#sf_url", `${link}`);
        await page.click("#sf_submit");
        try {
          msg.reply("Mendownload Video!");
          await page.waitForSelector(
            "#sf_result > div > div.result-box.video > div.info-box > div.link-box.single > div.def-btn-box > a"
          );
          const element = await page.$(
            "#sf_result > div > div.result-box.video > div.info-box > div.link-box.single > div.def-btn-box > a"
          );
          const text = await (await element.getProperty("href")).jsonValue();
          const judul = await page.$(
            "#sf_result > div > div.result-box.video > div.info-box > div.meta > div"
          );
          const judul1 = await (await judul.getProperty("title")).jsonValue();
          console.log(
            `[${moment().format("hh:mm:ss")}][!fb][${
              msg.from
            }] > Berhasil Dilakukan`
          );
          msg.reply(
            `*BERHASIL!!!*
Judul : ${judul1}

			           `);
		  
exec('wget "' + text + '" -O mp4/'+ namafile +'.mp4', (error, stdout, stderr) => {
  const media = MessageMedia.fromFilePath('mp4/'+ namafile +'.mp4');

	chat.sendMessage(media);
	if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }

    console.log(`stdout: ${stdout}`);
});
          browser.close();
        } catch (error) {
          console.log(
            `[${moment().format("hh:mm:ss")}][playdl][${
              msg.from
            }] > GAGAL Dilakukan`
          );
          msg.reply(
            `[GAGAL] PASTIKAN LINK VIDEO BERSIFAT PUBLIK DAN DAPAT DIAKSES OLEH SEMUA ORANG!*`
          );
          browser.close();
        }
      })
      .catch((err) => {
        console.log(
          `[${moment().format("hh:mm:ss")}][fbdl][${msg.from}] > GAGAL Dilakukan`
        );
        msg.reply(
          `[GAGAL] Server Sedang Down!\n\nSilahkan Coba Beberapa Saat Lagi!`
        );
        browser.close();
      });
	 
	 
  } 
else if (msg.body.startsWith("translate ")) {
const translatte = require('translatte');
var codelang = msg.body.split("[")[1].split("]")[0];
var text = msg.body.split("]")[1];
translatte(text, {to: codelang}).then(res => {
    msg.reply(res.text);
}).catch(err => {
    msg.reply(err);
});
}
else if (msg.body.startsWith('join ')) {
        const inviteCode = msg.body.split(' ')[1];
        try {
            await client.acceptInvite(inviteCode);
            msg.reply('Joined the group!');
        } catch (e) {
            msg.reply('That invite code seems to be invalid.');
        }
    }
else if (msg.body.startsWith("lirik ")) {
	var get = msg.body.split("lirik ")[1];
	var artis = get.split("-")[0];

	var lirik = get.split("-")[1];
	const { getLyrics } = require("genius-lyrics-api");
const options = {
	apiKey: 'NvLyzudSQ3xvZNwGaMzleGIFEDSe6qeQHl6gShNALO3LUI40mmS-nDT611UED5E7',
	title: lirik,
	artist: artis,
	optimizeQuery: true
};

getLyrics(options).then((lyrics) => msg.reply(`

${lyrics}`));

}
	else if (msg.body.startsWith("wiki ")) {
const cheerio = require('cheerio');
const request = require('request');
var yos = msg.body.split("wiki ")[1]
var jokowi = yos.replace(/ /g, "%20");
function foreach(arr, func){
  for(var i in arr){
    func(i, arr[i]);
  }
}
var url = "https://id.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles="+ jokowi
request.get({
  headers: {'content-type' : 'application/x-www-form-urlencoded'},
  url:     url,
},function(error, response, body){
    let $ = cheerio.load(body);
    var d = JSON.parse(body);
var fik = body.split('"extract":"')[1];
console.log(`

/////////////
`)
msg.reply(fik)
});

}
else if (msg.body.startsWith("fbdl ")) {

const request = require('request');
var req = msg.body.split(" ")[1];
const { exec } = require("child_process");
var crypto = require('crypto');
var fs = require('fs'); 

var filename = 'video'+crypto.randomBytes(4).readUInt32LE(0)+'saya';
var path = require('path');
request.get({
  headers: {'content-type' : 'application/x-www-form-urlencoded'},
  url:     'https://id.savefrom.net/9-how-to-download-facebook-video.html'+ req,
},function(error, response, body){
    let $ = cheerio.load(body);
   var gehu = $('a[rel="noreferrer no-follow"]').attr('href');
msg.reply("bentarr lagi di proses dulu ya .. 😣");
exec('wget "' + gehu + '" -O mp4/gue.mp4', (error, stdout, stderr) => {
     const media = MessageMedia.fromFilePath('mp4/gue.mp4');
chat.sendMessage(media);
	 
	if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
		msg.reply("_Gagal_");
        return;
    }

    console.log(`stdout: ${stdout}`);
});
});
}else if (msg.body.startsWith("igv ")) {
    msg.reply(`_Permintaan sedang diproses_`);
    let link = msg.body.split("igv ")[1];
	var namafile = link.split("/p/")[1].split("/")[0];

	const { exec } = require("child_process");
    const browser = await puppeteer.launch({
      headless: false,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
        "--window-size=1920x1080",
      ],
    });
    const page = await browser.newPage();
    await page
      .goto("https://id.savefrom.net/download-from-instagram", {
        waitUntil: "networkidle2",
      })
      .then(async () => {
        await page.type("#sf_url", `${link}`);
        await page.click("#sf_submit");
        try {
          msg.reply("_Video sedang didownload_");
          await page.waitForSelector(
            "#sf_result > div > div.result-box.video > div.info-box > div.link-box.single > div.def-btn-box > a"
          );
          const element = await page.$(
            "#sf_result > div > div.result-box.video > div.info-box > div.link-box.single > div.def-btn-box > a"
          );
          const text = await (await element.getProperty("href")).jsonValue();
          const judul = await page.$(
            "#sf_result > div > div.result-box.video > div.info-box > div.meta > div"
          );
          const judul1 = await (await judul.getProperty("title")).jsonValue();
          console.log(
            `[${moment().format("hh:mm:ss")}][!fb][${
              msg.from
            }] > Berhasil Dilakukan`
          );
          msg.reply(
            `*BERHASIL..!!!*
Judul : ${judul1}
			  
 
 Sedang mengirimkan video .. 🎬`
          );

exec('wget "' + text + '" -O mp4/'+ namafile +'.mp4', (error, stdout, stderr) => {
  const media = MessageMedia.fromFilePath('mp4/'+ namafile +'.mp4');

	msg.reply(media);
	if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }

    console.log(`stdout: ${stdout}`);
});
          browser.close();
        } catch (error) {
          console.log(
            `[${moment().format("hh:mm:ss")}][!fb][${
              msg.from
            }] > GAGAL Dilakukan`
          );
          msg.reply(
            `[GAGAL] PASTIKAN LINK VIDEO BERSIFAT PUBLIK DAN DAPAT DIAKSES OLEH SEMUA ORANG!*`
          );
          browser.close();
        }
      })
      .catch((err) => {
        console.log(
          `[${moment().format("hh:mm:ss")}][!fb][${msg.from}] > GAGAL Dilakukan`
        );
        msg.reply(
          `[GAGAL] Server Sedang Down!\n\nSilahkan Coba Beberapa Saat Lagi!`
        );
        browser.close();
      });
	 
	 
  } 
  else if (msg.body.startsWith("igp ")) {
    msg.reply(`*_Permintaan sedang diproses_*`);
    let link = msg.body.split("igp ")[1];
	var namafile = link.split("/p/")[1].split("/")[0];

	const { exec } = require("child_process");
    const browser = await puppeteer.launch({
      headless: false,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
        "--window-size=1920x1080",
      ],
    });
    const page = await browser.newPage();
    await page
      .goto("https://id.savefrom.net/download-from-instagram", {
        waitUntil: "networkidle2",
      })
      .then(async () => {
        await page.type("#sf_url", `${link}`);
        await page.click("#sf_submit");
        try {
          msg.reply("_Photo sedang didownload_");
          await page.waitForSelector(
            "#sf_result > div > div.result-box.video > div.info-box > div.link-box.single > div.def-btn-box > a"
          );
          const element = await page.$(
            "#sf_result > div > div.result-box.video > div.info-box > div.link-box.single > div.def-btn-box > a"
          );
          const text = await (await element.getProperty("href")).jsonValue();
          const judul = await page.$(
            "#sf_result > div > div.result-box.video > div.info-box > div.meta > div"
          );
          const judul1 = await (await judul.getProperty("title")).jsonValue();
          console.log(
            `[${moment().format("hh:mm:ss")}][!fb][${
              msg.from
            }] > Berhasil Dilakukan`
          );
          msg.reply(
            `*BERHASIL..!!!*
Judul : ${judul1}

_Sedang mengirimkan photo_`
          );

exec('wget "' + text + '" -O mp4/'+ namafile +'.jpg', (error, stdout, stderr) => {
  const media = MessageMedia.fromFilePath('mp4/'+ namafile +'.jpg');

	chat.sendMessage(media);
	if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }

    console.log(`stdout: ${stdout}`);
});
          browser.close();
        } catch (error) {
          console.log(
            `[${moment().format("hh:mm:ss")}][igp][${
              msg.from
            }] > GAGAL Dilakukan`
          );
          msg.reply(
            `[GAGAL]`
          );
          browser.close();
        }
      })
      .catch((err) => {
        console.log(
          `[${moment().format("hh:mm:ss")}][igp][${msg.from}] > GAGAL Dilakukan`
        );
        msg.reply(
          `[GAGAL] Server Sedang Down!\n\nSilahkan Coba Beberapa Saat Lagi!`
        );
        browser.close();
      });
	 
	 
  } 
else if (msg.body.startsWith("brainly ")) {
var hh = msg.body.split("brainly ")[1]
var tanya = hh.replace(/ /g, "%20");
const fetch = require('node-fetch')

const url = "https://amiruldev.com/brainly/?q="+ tanya
var regex = /<br\s*[\/]?>/gi;
const solution = () => {
  fetch(url).then(res => res.json()).then((res) => {
    
res.data.questionSearch.edges.slice(-2).forEach(item => {
	var tanyaan = item.node.content
    item.node.answers.nodes.slice(-2).forEach(item => { 
 var jawaban = item['content']
 var g = jawaban.replace(regex, "\n")
 var h  = g.replace(/<[^>]*>?/gm, '');
  msg.reply(`
Nama : *DP WhatsApp Bot*
Dibuat Oleh : *Ahmad Dandi Subhani*
Jenis Perintah : *brainly* spasi pertanyaan
            
======================
Pertanyaan : 
		
*${tanyaan.replace(regex, "\n")}*
      
Jawaban : 
	  
*${h}*
      
======================
      `);
   
      })
      console.log("=========")
    })
  })
}

solution();

}

else if (msg.body.startsWith("sial ")) {
const request = require('request');
var req = msg.body;
var tanggal = req.split(" ")[1];
var kk = req.split(" ")[2];
var bulan = kk.replace("0", "");
var tahun = req.split(" ")[3];
request.post({
  headers: {'content-type' : 'application/x-www-form-urlencoded'},
  url:     'http://www.primbon.com/primbon_hari_naas.php',
  body: "tgl="+ tanggal +"&bln="+ bulan +"&thn="+ tahun +"&submit=+Submit%21+"
},function(error, response, body){
    let $ = cheerio.load(body);
var y = $.html().split('<b>PRIMBON HARI NAAS</b><br><br>')[1];
    var t = y.split('.</i><br><br>')[1];
    var f = y.replace(t ," ");
    var x = f.replace(/<br\s*[\/]?>/gi, "\n\n");
    var h  = x.replace(/<[^>]*>?/gm, '');
    var d = h.replace("&amp;", '&')
console.log(""+ d);
msg.reply(` 
Nama : *DP WhatsApp Bot*
Dibuat Oleh : *Ahmad Dandi Subhani*
Jenis Perintah : *sial tl bl thn*

-----------------------------------
 Cek Hari Naas Kamu ~
 
 ${d}
----------------------------------
*DP-WhatsApp © 2020* 
 `); 
});
}

else if (msg.body.startsWith("pasangan ")) {
const request = require('request');
var req = msg.body;
var gh = req.split("pasangan ")[1];

var namamu = gh.split("&")[0];
var pasangan = gh.split("&")[1];
request.get({
  headers: {'content-type' : 'application/x-www-form-urlencoded'},
  url:     'http://www.primbon.com/kecocokan_nama_pasangan.php?nama1='+ namamu +'&nama2='+ pasangan +'&proses=+Submit%21+',
 
},function(error, response, body){
    let $ = cheerio.load(body);
var y = $.html().split('<b>KECOCOKAN JODOH BERDASARKAN NAMA PASANGAN</b><br><br>')[1];
    var t = y.split('.<br><br>')[1];
    var f = y.replace(t ," ");
    var x = f.replace(/<br\s*[\/]?>/gi, "\n");
    var h  = x.replace(/<[^>]*>?/gm, '');
    var d = h.replace("&amp;", '&')
console.log(""+ d);
msg.reply(` 
Nama : *DP WhatsApp Bot*
Dibuat Oleh : *Ahmad Dandi Subhani*
Jenis Perintah : *pasangan nama & nama*

-----------------------------------

 *Cek Kecocokan Jodoh Berdasarkan Nama ~*
 
 
 ${d}
 
----------------------------------
*DP-WhatsApp © 2020* 
 
 `); 
});
}
 else if (msg.body.startsWith("loker ")) {
const teks = msg.body.split("loker ")[1];
var req = teks.split("[")[1].split("]")[0];
var kerjaan = teks.split("]")[1];
const indeed = require('indeed-scraper');

const queryOptions = {
  host: 'id.indeed.com',
  query: kerjaan,
  city: req,
  radius: '100',
  level: 'entry_level',
  jobType: 'fulltime',
  maxAge: '7',
  sort: 'date',
  limit: 100
};

indeed.query(queryOptions).then(res => {
client.sendMessage(msg.from, 
`
Nama : *DP WhatsApp Bot*
Dibuat Oleh : *Ahmad Dandi Subhani*
Jenis Perintah : *loker [kota] posisi*

==============================
Nama Posisi :  *${res[0].title}*

Pekerjaan   : *${res[0].summary.replace("...", "").replace("...", "")}*

Perusahaan  : *${res[0].company}*

Tempat      : *${res[0].location}*

Waktu       : *${res[0].postDate}*

Link           : *${res[0].url}*

==============================

Nama Posisi :  *${res[1].title}*

Pekerjaan   : *${res[1].summary.replace("...", "")}*

Perusahaan  : *${res[1].company}*

Tempat      : *${res[1].location}*

Waktu       : *${res[1].postDate}*

Link           : *${res[1].url}*

==============================

Nama Posisi :  *${res[2].title}*

Pekerjaan   : *${res[2].summary.replace("...", "")}*

Perusahaan  : *${res[2].company}*

Tempat      : *${res[2].location}*

Waktu       : *${res[2].postDate}*

Link           : *${res[2].url}*

==============================

Nama Posisi :  *${res[3].title}*

Pekerjaan   : *${res[3].summary.replace("...", "")}*

Perusahaan  : *${res[3].company}*

Tempat      : *${res[3].location}*

Waktu       : *${res[3].postDate}*

Link           : *${res[3].url}*

==============================

`);

});
}

else if (msg.body == "wait") {
	const fs = require("fs");
const { exec } = require("child_process");

		const chat = await msg.getChat();
    if (msg.hasMedia) {
      const attachmentData = await msg.downloadMedia();
      
fs.writeFileSync("example.jpg", attachmentData.data, {encoding: 'base64'}, function(err) {
    console.log('File created');
});
const fetch = require("node-fetch")
const imageToBase64 = require('image-to-base64');
let response = ''
imageToBase64("example.jpg") // you can also to use url
    .then(
        (response) => {
fetch("https://trace.moe/api/search", {
  method: "POST",
  body: JSON.stringify({ image: response}),
  headers: { "Content-Type": "application/json" }
})
  .then(res => res.json())
  .then(result =>  {
var teks = `

What Anime Is That ?

Echi / Tidak : *${result.docs[0].is_adult}*
Judul Jepang : *${result.docs[0].title}*
Ejaan Judul : *${result.docs[0].title_romaji}*
Episode : *${result.docs[0].episode}*
Season  : *${result.docs[0].season}*

`;
var video = `https://trace.moe/preview.php?anilist_id=${result.docs[0].anilist_id}&file=${encodeURIComponent(result.docs[0].filename)}&t=${result.docs[0].at}&token=${result.docs[0].tokenthumb}`;
exec('wget "' + video + '" -O anime.mp4', (error, stdout, stderr) => {

let media = MessageMedia.fromFilePath('anime.mp4');
	client.sendMessage(msg.from, media, {
	caption: teks });
	if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }

    console.log(`stdout: ${stdout}`);
});
 });
 }
    )
    .catch(
        (error) => {
            console.log(error); //Exepection error....
        }
    )

	}
else{
		const tutor = MessageMedia.fromFilePath('tutor.jpeg');

		client.sendMessage(msg.from, tutor, {
        caption: "Kirim gambar dengan caption *wait* \n sesuai gambar diatas lalu tunggu sampai \n kita menemukan hasilnya"
      });
	  }
}
else if (msg.body.startsWith("nh ")) {
const kode = msg.body.split(" ")[1];
const NanaAPI = require("nana-api");
const nana = new NanaAPI();
const https = require("https");
const fs = require("fs");
const { exec } = require("child_process");

// Get gallery from book ID or book link
nana.g(kode).then((g) => {
if (g == 'Book not found!'){
msg.reply("Kode nuklir nya salah.")
}else{
var url = "https://t.nhentai.net/galleries/"+ g.media_id +"/cover.jpg"

exec('wget "' + url + '" -O cover.jpg', (error, stdout, stderr) => {
 var teks = "Judul English  : "+ g.title.english.slice("0") +" \n \n Judul Japanese : "+ g.title.japanese +"\n \n Judul Pendek   : "+ g.title.pretty +"\n \n Kode Nuklir    : "+ g.id +" \n ";

let media = MessageMedia.fromFilePath('cover.jpg');
	client.sendMessage(msg.from, media, {
	caption: teks });
	if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }

    console.log(`stdout: ${stdout}`);
});
}
})

}else if (msg.body.startsWith("ytmp3 ")) {
var url = msg.body.split("ytmp3 ")[1];
var videoid = url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/);

const ytdl = require("ytdl-core")
const { exec } = require("child_process");
if(videoid != null) {
   console.log("video id = ",videoid[1]);
} else {
    msg.reply("_Format yang digunakan salah._");
}
ytdl.getInfo(videoid[1]).then(info => {
if (info.length_seconds > 18000){
msg.reply("terlalu panjang.. ")
}else{

console.log(info.length_seconds)

msg.reply("_Permintaan sedang diproses_");
var YoutubeMp3Downloader = require("youtube-mp3-downloader");

//Configure YoutubeMp3Downloader with your settings
var YD = new YoutubeMp3Downloader({
    "ffmpegPath": "ffmpeg", 
    "outputPath": "./mp3",    // Where should the downloaded and en>
    "youtubeVideoQuality": "highest",       // What video quality sho>
    "queueParallelism": 100,                  // How many parallel down>
    "progressTimeout": 40                 // How long should be the>
});

YD.download(videoid[1]);


YD.on("finished", function(err, data) {


var musik = MessageMedia.fromFilePath(data.file);

msg.reply(` *+=[ Convert YT To MP3 ]=+*

Nama File : *${data.videoTitle}*
Nama : *${data.title}*
Artis : *${data.artist}*


*DP-WhatsApp © 2020* 
`);
msg.reply(musik);
});
YD.on("error", function(error) {
    console.log(error);
});

}});
}

else if (msg.body.startsWith("tts")) {
	msg.reply('*Harap Patuhi Rules* | DP Bot');
	var texttomp3 = require("text-to-mp3");
    var fs = require("fs");

var suara = msg.body.split("tts ")[1];
var text = suara;
var fn = "tts/suara.mp3";




if(process.argv.indexOf("-?")!== -1){
  console.log("TextToMp3 bach use the TextToMp3 library wich use the google translate public API to generate an mp3 with ");
  console.log("-t \t\t\t Provide the Text here with \" arround the text \", limited to 200 characters");
  console.log("-f \t\t\t Provide the file name of MP3 you whant generate, otherways it will be generated automatically");
  console.log("");
  return;
}


if(process.argv.indexOf("-t")!== -1)
  text=suara;

if(process.argv.indexOf("-f")!== -1)
  fn=suara;

text = text.replace(/ +(?= )/g,'');//remove all multiple space

if(typeof text ===  "undefined" || text === ""
  || typeof fn === "undefined" || fn === "") { // just if I have a text I'm gona parse
  console.log("missing required params, check out the help with -?");
}

//HERE WE GO
texttomp3.getMp3(text, function(err, data){
  if(err){
    console.log(err);
    return;
  }

  if(fn.substring(fn.length-4, fn.length) !== ".mp3"){ // if name is not well formatted, I add the mp3 extention
    fn+=".mp3";
  }
  var file = fs.createWriteStream(fn); // write it down the file
  file.write(data);
 
  console.log("MP3 SAVED!");
  
});
await new Promise(resolve => setTimeout(resolve, 500));

	if(text.length > 500){ // check longness of text, because otherways google translate will give me a empty file
  msg.reply("_Terlalu Panjang,Maksimal 500 Karakter_")
}else{
	const media = MessageMedia.fromFilePath(fn);

	chat.sendMessage(media);

}


}
else if (msg.body.startsWith("quotes")) {
const request = require('request');
request.get({
  headers: {
'user-agent' : 'Mozilla/5.0 (Linux; Android 8.1.0; vivo 1820) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Mobile Safari/537.36'
},
  url: 'https://jagokata.com/kata-bijak/acak.html',
},function(error, response, body){
    let $ = cheerio.load(body);
    var author = $('a[class="auteurfbnaam"]').contents().first().text();
   var kata = $('q[class="fbquote"]').contents().first().text();

client.sendMessage(
        msg.from,
        `
 _${kata}_
        
    
	*~${author}*
         `
      );

});
}

else if (msg.body.startsWith("bucin")) {
const request = require('request');
request.get({
  headers: {
'user-agent' : 'Mozilla/5.0 (Linux; Android 8.1.0; vivo 1820) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Mobile Safari/537.36'
},
  url: 'https://jagokata.com/kata-bijak/kata-cinta.html',
},function(error, response, body){
    let $ = cheerio.load(body);
    var author = $('a[class="auteurfbnaam"]').contents().first().text();
   var kata = $('q[class="fbquote"]').contents().first().text();

client.sendMessage(
        msg.from,
        `
     _${kata}_
        
    
	*~${author}*
         `
      );

});
}


else if (msg.body.startsWith("nama ")) {
const cheerio = require('cheerio');
const request = require('request');
var nama = msg.body.split("nama ")[1];
var req = nama.replace(/ /g,"+");
request.get({
  headers: {'content-type' : 'application/x-www-form-urlencoded'},
  url:     'http://www.primbon.com/arti_nama.php?nama1='+ req +'&proses=+Submit%21+',
},function(error, response, body){
    let $ = cheerio.load(body);
    var y = $.html().split('arti:')[1];
    var t = y.split('method="get">')[1];
    var f = y.replace(t ," ");
    var x = f.replace(/<br\s*[\/]?>/gi, "\n");
    var h  = x.replace(/<[^>]*>?/gm, '');
console.log(""+ h);
msg.reply(`
Nama : *DP WhatsApp Bot*
Dibuat Oleh : *Ahmad Dandi Subhani*
Jenis Perintah : *nama spasi Nama*
   
*Arti Dari Namamu*

  ----------------------------------
Nama _*${nama}*_ ${h}
  ----------------------------------
*DP-WhatsApp © 2020* 
`
        );
});
}
else if (msg.body.startsWith("sifat ")) {
const cheerio = require('cheerio');
const request = require('request');
var req = msg.body.split("[")[1].split("]")[0];
var nama = req.replace(/ /g," ");
var pesan = msg.body;
var y = pesan.replace(/ /g,"+ ");
var tanggal = y.split("]+")[1].split("-")[0];
var bulan = y.split("-")[1];
var tahun = y.split("-")[2];
request.post({
  headers: {'content-type' : 'application/x-www-form-urlencoded'},
  url:     'http://www.primbon.com/sifat_karakter_tanggal_lahir.php',
  body:    "nama="+ req +"&tanggal="+ tanggal +"&bulan="+ bulan +"&tahun="+ tahun +"&submit=+Submit%21+"
},function(error, response, body){
 let $ = cheerio.load(body);
    $('title').after('body')
    var y = $.html().split('<b>Nama :</b>')[1];
    var t = y.split('</i><br><br>')[1];
    var f = y.replace(t ," ");
    var x = f.replace(/<br\s*[\/]?>/gi, "\n");
    var h  = x.replace(/<[^>]*>?/gm, '');
console.log(""+ h);
            msg.reply(
            `
Nama : *AZ WhatsApp Bot*
Dibuat Oleh : *Alif Putra Darmawan*
Jenis Perintah : *sifat [Nama] tl-bl-thn*

*Sifat Dari Nama dan Tanggal Lahir*
         
  ----------------------------------
Nama ${h}
  ----------------------------------
*DP-WhatsApp © 2020* 
`
        );
});
  }
 
else if (msg.body.startsWith("jne ")) {
const cheerio = require('cheerio');
const request = require('request');
var resic = msg.body.split("jne ")[1];
var code = "jne"

var query = 'https://resinesia.com/wp-admin/admin-ajax.php';
request.post({
  headers: {'content-type' : 'application/x-www-form-urlencoded'},
  url:     query,
 body:  "action=minha_ongkir_cek_resi&waybill_number="+ resic +"&page_link=https%3A%2F%2Fresinesia.com%2Fcek-resi%2F&courier="+ code
},function(error, response, body){
    let $ = cheerio.load(body);
//    var ar = $('source').attr('src');
var h  = body.replace(/<[^>]*>?/gm, "\r");
var k = h.replace("Share Link", '');
client.sendMessage(
      msg.from,
      `  ${k}
      `);
});
}

else if (msg.body.startsWith("jnt ")) {
const cheerio = require('cheerio');
const request = require('request');
var resic = msg.body.split("jnt ")[1];
var code = "jnt"

var query = 'https://resinesia.com/wp-admin/admin-ajax.php';
request.post({
  headers: {'content-type' : 'application/x-www-form-urlencoded'},
  url:     query,
 body:  "action=minha_ongkir_cek_resi&waybill_number="+ resic +"&page_link=https%3A%2F%2Fresinesia.com%2Fcek-resi%2F&courier="+ code
},function(error, response, body){
    let $ = cheerio.load(body);
//    var ar = $('source').attr('src');
var h  = body.replace(/<[^>]*>?/gm, "\r");
var k = h.replace("Share Link", '');
client.sendMessage(
      msg.from,
      `  ${k}
      `);
});
}

else if (msg.body.startsWith("sicepat ")) {
const cheerio = require('cheerio');
const request = require('request');
var resic = msg.body.split("sicepat ")[1];
function foreach(arr, func){
  for(var i in arr){
    func(i, arr[i]);
  }
}
var url = "https://api.binderbyte.com/cekresi?awb="+ resic +"&api_key=fd0f20f2f62da7eac735ae56d3b8206d95fd6ed5e4180d5b9fff13598d7f9d35&courier=sicepat"
request.get({
  headers: {'content-type' : 'application/x-www-form-urlencoded'},
  url:     url,
 
},function(error, response, body){
    let $ = cheerio.load(body);
    var d = JSON.parse(body);

console.log(`

/////////////
`)
var result = ""
foreach(d.data.tracking, function(i, v){
 result += d.data.tracking[i].date +" : *"+ d.data.tracking[i].desc +"* \n\n"
});
msg.reply(result)
});

}

else if (msg.body.startsWith("lex ")) {
const cheerio = require('cheerio');
const request = require('request');
var resic = msg.body.split("lex ")[1];
var code = "lex"

var query = 'https://resinesia.com/wp-admin/admin-ajax.php';
request.post({
  headers: {'content-type' : 'application/x-www-form-urlencoded'},
  url:     query,
 body:  "action=minha_ongkir_cek_resi&waybill_number="+ resic +"&page_link=https%3A%2F%2Fresinesia.com%2Fcek-resi%2F&courier="+ code
},function(error, response, body){
    let $ = cheerio.load(body);
//    var ar = $('source').attr('src');
var h  = body.replace(/<[^>]*>?/gm, "\r");
var k = h.replace("Share Link", '');
client.sendMessage(
      msg.from,
      `  ${k}
      `);
});
}
else if (msg.body.startsWith("sap ")) {
const cheerio = require('cheerio');
const request = require('request');
var resic = msg.body.split("sap ")[1];
var code = "sap"

var query = 'https://resinesia.com/wp-admin/admin-ajax.php';
request.post({
  headers: {'content-type' : 'application/x-www-form-urlencoded'},
  url:     query,
 body:  "action=minha_ongkir_cek_resi&waybill_number="+ resic +"&page_link=https%3A%2F%2Fresinesia.com%2Fcek-resi%2F&courier="+ code
},function(error, response, body){
    let $ = cheerio.load(body);
//    var ar = $('source').attr('src');
var h  = body.replace(/<[^>]*>?/gm, "\r");
var k = h.replace("Share Link", '');
client.sendMessage(
      msg.from,
      `  ${k}
      `);
});
}
else if (msg.body.startsWith("pcp ")) {
const cheerio = require('cheerio');
const request = require('request');
var resic = msg.body.split("pcp ")[1];
var code = "pcp"

var query = 'https://resinesia.com/wp-admin/admin-ajax.php';
request.post({
  headers: {'content-type' : 'application/x-www-form-urlencoded'},
  url:     query,
 body:  "action=minha_ongkir_cek_resi&waybill_number="+ resic +"&page_link=https%3A%2F%2Fresinesia.com%2Fcek-resi%2F&courier="+ code
},function(error, response, body){
    let $ = cheerio.load(body);
//    var ar = $('source').attr('src');
var h  = body.replace(/<[^>]*>?/gm, "\r");
var k = h.replace("Share Link", '');
client.sendMessage(
      msg.from,
      `  ${k}
      `);
});
}

 else if (msg.body.startsWith("ytd ")) {
const url = msg.body.split("ytd ")[1];
const exec = require('child_process').exec;

var videoid = url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/);

const ytdl = require("ytdl-core")
if(videoid != null) {
   console.log("video id = ",videoid[1]);
} else {
    msg.reply("_Format yang digunakan salah_");
}
msg.reply("_Video sedang didownload_");
ytdl.getInfo(videoid[1]).then(info => {
if (info.length_seconds > 18000){
msg.reply("_Durasi terlalu panjang_ \n _Klik link dibawah ini untuk mendownload video._ \π \n "+ info.formats[0].url)
}else{

console.log(info.length_seconds)

function os_func() {
    this.execCommand = function (cmd) {
        return new Promise((resolve, reject)=> {
           exec(cmd, (error, stdout, stderr) => {
             if (error) {
                reject(error);
                return;
            }
            resolve(stdout)
           });
       })
   }
}
var os = new os_func();

os.execCommand('ytdl ' + url + ' -q highest -o mp4/'+ videoid[1] +'.mp4').then(res=> {
    var media = MessageMedia.fromFilePath('mp4/'+ videoid[1] +'.mp4');
chat.sendMessage(media);
}).catch(err=> {
    console.log("os >>>", err);
})

}
});

 }
   else if (msg.body == "donasi" ||
    msg.body === "donasi ") {
    // Send a new message to the same chat
    client.sendMessage(msg.from, ` 
	null
	`);
  }
     else if (msg.body == "rules" ||
    msg.body === "rules ") {
    // Send a new message to the same chat
    msg.reply(` 
Nama : *DP WhatsApp Bot*
Dibuat Oleh : *Ahmad Dandi Subhani*
Jenis Perintah : *rules*

*༺ PERATURAN BOT ༻*

• Dilarang Spam
• Dilarang Menggunakan Fitur Downloader Diatas 25menit / 25mb
• Dilarang Telfon/Vc
• Dilarang Share Bot Privat Ini
• Dilarang Rusuh Menggunakan Fitur
Direct Message
• Dilarang Memakai Emot/Karakter
Pada Menu Fs Maker

**NB:* Melanggar akan di banned permanen


	`);
  }
 else if (msg.body == "5") {
const cheerio = require('cheerio');
const request = require('request');

const { exec } = require("child_process");
request.get({
  headers: {'content-type' : 'application/x-www-form-urlencoded'},
  url:     'https://api.computerfreaker.cf/v1/anime',
 
},function(error, response, body){
    let $ = cheerio.load(body);
    var d = JSON.parse(body);
console.log(d.url); 
exec('wget "' + d.url + '" -O ok.jpg', (error, stdout, stderr) => {
	var media = MessageMedia.fromFilePath('ok.jpg');

	chat.sendMessage(media);
	if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }

    console.log(`stdout: ${stdout}`);
});
});
}
else if (msg.body == "6") {
const cheerio = require('cheerio');
const request = require('request');

const { exec } = require("child_process");
request.get({
  headers: {'content-type' : 'application/x-www-form-urlencoded'},
  url:     'https://api.computerfreaker.cf/v1/dva',
 
},function(error, response, body){
    let $ = cheerio.load(body);
    var d = JSON.parse(body);
console.log(d.url); 
exec('wget "' + d.url + '" -O adv.jpg', (error, stdout, stderr) => {
	var media = MessageMedia.fromFilePath('adv.jpg');

	chat.sendMessage(media);
	if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }

    console.log(`stdout: ${stdout}`);
});
});
}
 else if (msg.body == "harom") {
const cheerio = require('cheerio');
const request = require('request');

const { exec } = require("child_process");
request.get({
  headers: {'content-type' : 'application/x-www-form-urlencoded'},
  url:     'https://api.computerfreaker.cf/v1/nsfwneko',
 
},function(error, response, body){
    let $ = cheerio.load(body);
    var d = JSON.parse(body);
console.log(d.url); 
exec('wget "' + d.url + '" -O ok.jpg', (error, stdout, stderr) => {
	var media = MessageMedia.fromFilePath('ok.jpg');

	chat.sendMessage(media);
	if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }

    console.log(`stdout: ${stdout}`);
});
});
}
  else if (msg.body.startsWith("pesan ")) {
    // Direct send a new message to specific id
    let number = msg.body.split(" ")[1];
    let messageIndex = msg.body.indexOf(number) + number.length;
    let message = msg.body.slice(messageIndex, msg.body.length);
    number = number.includes("@c.us") ? number : `${number}@c.us`;
    let chat = await msg.getChat();
    chat.sendSeen();
    client.sendMessage(number, message);
  }
  else if (msg.body == "Iya?" ||
    msg.body === "Iya?") {
    // Send a new message to the same chat
    client.sendMessage(msg.from, "Gabut bangettt sihhh.. 🤭");
  }
  else if (msg.body == "Save nomor gw donk" || msg.body == "save donk" || msg.body == "Save euy" || msg.body == "Save donk") {
    client.sendMessage(msg.from, "Save nomor gw juga donk:v wa.me/6289636035164")
  }
  else if (msg.body == "kamu bot?") {
    client.sendMessage(msg.from, "y")
  }
 else if (msg.body == "p" ||
    msg.body === "Assalamualaikum") {
    // Send a new message to the same chat
    client.sendMessage(msg.from, "Waalaikumsalam Warahmatullahi Wabarakatuh");
  } else if (msg.body == "Assalamuallaikum" || msg.body == "Assalamu'alaikum" || msg.body == "mikum" || msg.body == "assalamuallaikum" || msg.body == "Assalamualaikum" || msg.body == "assalamualaikum") {
    client.sendMesssage(msg.from, "Waalaikumusallam");
  }else if (msg.body == "menu") {
    msg.reply(`
      Nama : *DP WhatsApp Bot*
      Dibuat Oleh : *@dandisubhani_*
      Jenis Perintah : *menu*

      Berikut daftar perintah yang bisa digunakan :
      • *0* : Menu Admin.
      • *1* : Menu Utama.
      • *2* : Menu Downloader.
      • *3* : Menu Horoscape.
      • *4* : Menu Cek Resi.
      • *5* : Random Anime.
      • *6* : Random ADV. 
      • *7* : Logo Maker Bot.`);
}
else if (msg.body == "0") {
 msg.reply( `
Nama : *DP-WhatsApp Bot*
Dibuat Oleh : *@dandisubhani_*
Versi : *1.2*

• *subject* = Ganti nama grup.
• *kick* = Kick member grup.
• *promote* = Promote admin grup.
• *demote* = Menurunkan admin group.
• *add* = Menambah member group.
• *deskripsi* = Ganti deskripsi grup.
 `);
 }
 
 else if (msg.body == "1") {
 msg.reply(`
Nama : *DP-WhatsApp Bot*
Dibuat Oleh : *Ahmad Dandi Subhani*
Versi : *1.2*

• *quotes* : Melihat quotes dari tokoh terkenal.
• *lagu*  : Download lagu
• *wait* : Menampilkan informasi anime dengan mengirim gambar dengan caption wait.
• *brainly* : Menampilkan jawaban yang terdapat pada brainly.
• *translate* : Menerjemahkan kedalam bahasa yang di inginkan.
• *codebahasa*: Melihat code bahasa.
• *wiki* : Melihat artikel di Wikipedia.
• *bucin* : Menampilkan quotes bucin.
• *tts* : Mengubah teks kedalam suara.
• *lirik* : Mencari lirik lagu
`);
 }
else if (msg.body == "2") {
 msg.reply(`
Nama : *DP-WhatsApp Bot*
Dibuat Oleh : *Ahmad Dandi Subhani*
Versi : *1.2*

• *ytd* : Mendownload video dari youtube
cnth : yt url
• *ytmp3* : Mendownload mp3 dari youtube
cnth : ytmp3 url
• *fb* : Mendownload video dari facebook
cnth : fbdl url
• *igp* : Mendownload media fotodari instagram
cnth : igp url
• *igv* : Mendownload video dari instagram
cnth : igv url

`);
}

else if (msg.body == "3") {
	msg.reply(`
Nama : *DP-WhatsApp Bot*
Dibuat Oleh : *Ahmad Dandi Subhani*
Versi : *1.2*

• *nama* : Melihat arti dari nama kamu
 cnth : nama Dandi
• *sifat* : cari sifat berdasarkan nama dan tanggal lahir
contoh : sifat [Dandi] 20-01-2005
•*sial* : Check hari apes mu berdasarkan tanggal lahir.
cnth : sial 20 01 2005
• *pasangan* : Check kecocokan jodoh
cnth : pasangan Dandi & Kepoo:v
`);
}	
else if (msg.body == "7") {
	msg.reply(`
Nama : *DP-WhatsApp Bot*
Dibuat Oleh : *Ahmad Dandi Subhani*

Generate Maker Text

• *glow* Namamu
• *galaxy* Namamu
• *art* Namanu
`);
}	

else if (msg.body == "haram") {
msg.reply(" Hallo silahkan reply pesan ini dan sebutkan umur kamu \n\n dengan format *umur(spasi) umur* \n contoh *umur 21*");

}else if (msg.body.startsWith('umur ')){
var umur = msg.body.split(" ")[1];
if (umur < 18){
msg.reply(" Hallo umur kamu belum cukup untuk menampilkan menu ini");
}else{

 client.sendMessage(msg.from,  `
Gaboleh Cokkkkk Masi Kecill
 `
);
}
}
  else if (msg.body == "4") {
	  msg.reply(`
Nama : *DP-WhatsApp Bot*
Dibuat Oleh : *Ahmad Dandi Subhani*
Versi : *1.2*

• *jnt kode resi*
• *jne kode resi*
• *sicepat kode resi*
• *sap kode resi*
• *pcp kode resi*
• *lex kode resi*
	  `);
  }
  else if (msg.body == "codebahasa") {
    msg.reply(`
Nama : *DP-WhatsApp Bot*
Dibuat Oleh : *Ahmad Dandi Subhani*
Versi : *1.2*

	Bahasa                Code
######               #####
English                 |  en
Esperanto            |  eo
Estonian              |  et
Finnish                |  fi
French                 |  fr
Frisian                 |  fy
Galician               |  gl
Georgian              |  ka
German               |  de
Greek                   |  el
Gujarati               |  gu
Haitian Creole    |  ht
Hausa                  |  ha
Hawaiian            |  haw (ISO-639-2)
Hebrew               |  he or iw
Hindi                   |  hi
Hmong                |  hmn (ISO-639-2)
Hungarian          |  hu
Icelandic             |  is
Igbo                     |  ig
Indonesian         |  id
Irish                     |  ga
Italian                  |  it
Japanese             |  ja
Javanese              |  jv
Kannada              |  kn
Kazakh                 |  kk
Khmer                  |  km
Kinyarwanda      |  rw
Korean                 |  ko
Kurdish               |  ku
Kyrgyz                |  ky
Lao                      |  lo
Latin                   |  la
Latvian               |  lv
Lithuanian         |  lt
Luxembourg     |  lb
Macedonian      |  mk
Malagasy           |  mg
Malay                 |  ms
Malayalam        |  ml
Maltese               |  mt
Maori                  |  mi
Marathi               |  mr
Myanmar.          |  my
Nepali                 |  ne
Norwegian          |  no
Nyanja.               |  ny
Odia (Oriya)        |  or
Pashto                |  ps
Persian               |  fa
Polish                 |  pl
Portuguese.        |  pt
Punjabi               |  pa
Romanian           |  ro
Russian               |  ru
Samoan               |  sm
Scots Gaelic        |  gd
Serbian               |  sr
Sesotho               |  st
Shona                 |  sn
Sindhi                 |  sd
Slovak                 |  sk
Slovenian            |  sl
Somali                 |  so
Spanish               |  es
Sundanese          |  su
Swahili                |  sw
Swedish               |  sv
Tagalog.               |  tl
Tajik                     |  tg
Tamil                    |  ta
Tatar                     |  tt
Telugu                  |  te
Thai                      |  th
Turkish                |  tr
Turkmen              |  tk
Ukrainian             |  uk
Urdu                      |  ur
Uyghur                  |  ug
Uzbek                    |  uz
Vietnamese          |  vi
Welsh                   |  cy
Xhosa                   |  xh
Yiddish                 |  yi
Yoruba                  |  yo
Zulu                      |  zu
      ` );
  } else if (msg.body == "Keluar lo") {
    // Leave the group
    let chat = await msg.getChat();
    if (chat.isGroup) {
      chat.leave();
    } else {
      msg.reply("_Perintah ini hanya bisa digunakan digrup_");
      msg.reply("_Perintah ini hanya bisa digunakan digrup_");
    }
  } else if (msg.body.startsWith("lagu ")) { 
    msg.reply("_Sedang Mendownload Lagu_");
let axios = require('axios').default;

async function searchYoutube(keyword) {
    let request = await axios.get("https://www.youtube.com/results", {
        params: {
            "search_query": keyword,
            "disable_polymer": 1
        }
    });
    let body = request.data;
    if (body.substring(0,92) == '<!doctype html><html  style="font-size: 10px;font-family: Roboto, Arial, sans-serif;" lang="') {
        let page = String(body);
        let pageSource = page.split(",");
        let id = [];
        let idIndex = 0;
        for (let index in pageSource) {
            if (pageSource[index].substring(0, 10) == '"videoId":' && pageSource[index].length == 23) {
                idIndex ++;
                if (idIndex % 2) {
                    id.push(pageSource[index].substring(11, pageSource[index].length - 1));
                };
            };
        };
        return id;
    }
    else {
        let page = String(body);
        let pageSource = page.split(" ");
        let id = [];
        let idIndex = 0;
        for (let index = 0; index<pageSource.length; index+=1) {
            element = pageSource[index];
            if (element.substring(0,15) == 'href="/watch?v='  && element.length == 27) {
                idIndex++;
                if (idIndex % 2) {
                    id.push(element.substring(15, element.length -1));
                };
            };
        };
        return id;
    };
};
var hh = msg.body.split("lagu")[1];
var keyword = hh.replace(/ /g, "+");
//////////Calling Async Function//////////
(async () => {

    index = 0

    result = await searchYoutube(keyword);
    console.log(result[index])
    var YoutubeMp3Downloader = require("youtube-mp3-downloader");
console.log(result[index]);
//Configure YoutubeMp3Downloader with your settings
var YD = new YoutubeMp3Downloader({
    "ffmpegPath": "ffmpeg", 
    "outputPath": "./mp3",    // Where should the downloaded and en>
    "youtubeVideoQuality": "lowest",       // What video quality sho>
    "queueParallelism": 100,                  // How many parallel down>
    "progressTimeout": 18000                 // How long should be the>
});

//Download video and save as MP3 file
YD.download(result[index]);

YD.on("finished", function(err, data) {


const musik = MessageMedia.fromFilePath(data.file);
msg.reply(` 
*[+]BERHASIL MENDOWNLOAD[+]*

🔉 *${data.videoTitle}* 

_S&K: Dilarang Mendownload Lagu diatas 15-20 Menit_
`);
msg.reply(musik);
});
YD.on("progress", function(data) {
});
})();
}

});

