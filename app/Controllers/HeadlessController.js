import User from '../Models/UserModel';

const puppeteer = require('puppeteer');

function delay(time) {
  return new Promise(((resolve) => {
    setTimeout(resolve, time);
  }));
}

export const addBankForUser = async (req, res) => {
  const browser = await puppeteer.launch({ headless: false });

  const { email, firstname, lastname, IFCS, accountNumber } = req.body;

  // const email = 'azhar.hussain@dartmouth.edu';
  // const name = 'Azhar Hussain';
  // const IFC = 'SBIN0000058';
  // const accountNumber = '123123123';

  // login to razorpay
  const page = await browser.newPage();
  await page.goto('https://dashboard.razorpay.com/#/access/signin', { waitUntil: 'networkidle0' });
  await page.waitForSelector('input[ng-model="login.data.email"]').catch((e) => { res.status().send({ e }); });


  await page.focus('input[ng-model="login.data.password"]').catch((e) => {
    res.status(401).send({ e });
  });
  await page.keyboard.type('spacejam98').catch((e) => {
    res.status(402).send({ e });
  });

  await page.focus('input[ng-model="login.data.email"]').catch((e) => {
    res.status(403).send({ e });
  });
  await page.keyboard.type('quantweb98@gmail.com').catch((e) => {
    res.status(404).send({ e });
  });

  // get to route account page
  await page.click('button[ng-disable="loginInProgress"]').catch((e) => {
    res.status(405).send({ e });
  });
  await page.waitForSelector('.Modal-close').catch((e) => {
    res.status(406).send({ e });
  });
  await page.click('.Modal-close').catch((e) => {
    res.status(407).send({ e });
  });
  await page.goto('https://dashboard.razorpay.com/#/app/route/accounts', { waitUntil: 'networkidle0' }).catch((e) => {
    res.status(408).send({ e });
  });
  await page.waitForSelector('.btn-primary').catch((e) => {
    res.status(409).send({ e });
  });
  await page.click('.btn-toolbar>button.btn-primary').catch((e) => {
    res.status(410).send({ e });
  });

  // add name and email
  await page.keyboard.type(`${firstname} ${lastname}`).catch((e) => {
    res.status(411).send({ e });
  });
  await page.keyboard.press('Tab');
  await page.keyboard.type(email).catch((e) => {
    res.status(412).send({ e });
  });
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');

  // add business details
  await delay(2000);
  await page.waitForSelector('input[name="business_name"]').catch((e) => {
    res.status(413).send({ e });
  });
  await page.keyboard.type(`${firstname} ${lastname}`).catch((e) => {
    res.status(414).send({ e });
  });
  await page.keyboard.press('Tab').catch((e) => {
    res.status(415).send({ e });
  });
  await page.keyboard.type('quantweb98@gmail.com');
  await page.select('select[name="business_type"]', '2').catch((e) => {
    res.status(416).send({ e });
  });
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');

  // move to bank details page
  await page.waitForSelector('input[name="bank_branch_ifsc"]').catch((e) => {
    res.status(417).send({ e });
  });

  // bank info
  await page.keyboard.type(IFCS);
  await page.keyboard.press('Tab');
  await page.keyboard.type(accountNumber);
  await page.keyboard.press('Tab');
  await page.keyboard.type(accountNumber);
  await page.keyboard.press('Tab');
  await page.keyboard.type(`${firstname} ${lastname}`);
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await delay(2000);
  await page.click('.Activation--wizard>footer>.Button--primary').catch((e) => {
    res.status(418).send({ e });
  });

  // agree to t&case
  await delay(2000);
  await page.waitForSelector('.Input-el').catch((e) => {
    res.status(419).send({ e });
  });
  await page.click('.Input-el').catch((e) => {
    res.status(420).send({ e });
  });
  await page.mouse.click(318, 427);
  await page.keyboard.press('Tab');
  await page.keyboard.press('Space');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');

  // close modal
  await page.waitForSelector('.Alert--info').catch((e) => {
    res.status(421).send({ e });
  });
  await page.click('.Modal-close').catch((e) => {
    res.status(422).send({ e });
  });

  // check for Success
  await page.click('form[name="accountsListFilter"]>div>input[name="email"]').catch((e) => {
    res.status(423).send({ e });
  });
  await page.keyboard.type(email);
  await page.keyboard.press('Enter');
  await delay(2000);
  const rzpAccount = await page.evaluate(() => document.querySelector('.table-responsive>table>tbody>tr>td>a>code').textContent).catch((e) => {
    res.status(424).send({ e });
  });

  User.findByIdAndUpdate(
    req.user.id,
    { $set: { bankAccount: rzpAccount, bankSet: true } },
    (err) => {
      if (err) {
        res.status(425).send({ err });
      }
      res.send({ rzpAccount });
    },
  );
  console.log('test');
  await browser.close();
};
