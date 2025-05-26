const { Builder,By } = require('selenium-webdriver');
const assert = require('assert');
require('dotenv').config();

describe("Tests", async function () {
  let driver;
this.timeout(20000);

  before(async () => {
    driver = await new Builder().forBrowser("chrome").build();
  });
it("Register", async () => {
  await driver.get("http://localhost:5173/");
  let linkForRegister = await driver.findElement(By.id("registerLink"));
  await linkForRegister.click();
  let firstNameInput = await driver.findElement(By.id("firstName"));
  await firstNameInput.sendKeys("admin");
  let SurNameInput = await driver.findElement(By.id("surName"));
  await SurNameInput.sendKeys("admin");
  let phoneInput = await driver.findElement(By.id("phone"));
  await phoneInput.sendKeys("admin");
  let emailInput = await driver.findElement(By.css(`input[type="email"]`));
  await emailInput.sendKeys("admin@gmail.com");
  let passwordInput = await driver.findElement(By.css(`input[type="password"]`));
  await passwordInput.sendKeys("adminadmin");
  let sexSelect = await driver.findElement(By.name("sex"));
  await sexSelect.click();
  let option = await sexSelect.findElement(By.xpath(`//option[contains(text(), '👦 Male')]`));
  await option.click();
  let submitButton = await driver.findElement(By.id('submit'));
  await submitButton.click();
});
  it("Get logo text by id", async () => {
    await driver.get("http://localhost:5173/");
    let elementById = await driver.findElement(By.id("Logo"));
    const text = await elementById.getText()
    assert.strictEqual(text, "Sign in");
  });

 it("Get Input for email", async () => {
  await driver.get("http://localhost:5173/");
  let elementByTag = await driver.findElement(By.tagName("input"));
  let tagName = await elementByTag.getTagName(); 
  assert.strictEqual(tagName, "input");
});
 it("Get Input for password", async () => {
  await driver.get("http://localhost:5173/");
  let elementByTag = await driver.findElement(By.css(`input[type="password"]`));
  let tagName = await elementByTag.getTagName()
  assert.strictEqual(tagName, "input");
});


 it("Authentication", async () => {
  await driver.get("http://localhost:5173/");
  let emailInput = await driver.findElement(By.css(`input[type="email"]`));
  await emailInput.sendKeys("admin@gmail.com")
  let passwordInput = await driver.findElement(By.css(`input[type="password"]`))
  await passwordInput.sendKeys("adminadmin")
  let submitButton = await driver.findElement(By.id('submit'))
  await submitButton.click();
});


  // it("Get logo text by className", async () => {
  //   await driver.get("http://localhost:5173/");
  //   let elementByClassName = await driver.findElement(
  //     By.className("_navbarWrapper_16ijg_53")
  //   );
  //   let Navbar = await elementByClassName.isDisplayed();
  //   assert.strictEqual(Navbar, true);
  // });

  // it("Get logo text by css", async () => {
  //   await driver.get("http://localhost:5173/");
  //   let elementByClassName = await driver.findElement(
  //     By.css("._navbarWrapper_16ijg_53")
  //   );
  //   let Navbar = await elementByClassName.isDisplayed();
  //   assert.strictEqual(Navbar, true);
  // });

  // it("Get navbar by xpath ", async () => {
  //   await driver.get("http://localhost:5173/");
  //   let elementByXpath = await driver.findElement(
  //     By.xpath(`//*[@id="root"]/div[1]/div/div/a`)
  //   );
  //   let Navbar = await elementByXpath.isDisplayed();
  //   assert.strictEqual(Navbar, true);
  // });

  // it("sleep", async () => {
  //   await driver.get("http://localhost:4000/");
  //   await driver.findElement(By.className("_btn_1c799_54"));
  //   await driver.sleep(10000);
  //   let element = await driver.findElement(By.className("_btn_1c799_54"));
  //   assert(await element.isDisplayed(), "Displayed");
  // });

  // it("Implicit", async () => {
  //   await driver.manage().setTimeouts({ implicit: 5000 });
  //   await driver.get("http://localhost:4000/");
  //   let elementById2 = await driver.findElement(
  //     By.className("_navbarWrapper_16ijg_53")
  //   );
  //   assert.strictEqual(await elementById2.isDisplayed(), true);
  // });

  // it("Explicit", async () => {
  //   await driver.get("http://localhost:4000/");
  //   let elementById = await driver.findElement(
  //     By.className("_navbarWrapper_16ijg_53")
  //   );
  //   await driver.wait(until.elementIsVisible(elementById), 5000);
  //   assert.strictEqual(await elementById.isDisplayed(), true);
  // });

  // it("Test Login", async () => {
  //   await driver.get("http://localhost:4000/");
  //   await driver.findElement(By.className("_btn_1c799_54")).click();
  //   let nickNameInput = await driver.findElement(By.name("username"));
  //   let NickName = process.env.USERNAMEINTOUCH;
  //   let Password = process.env.PASSWORD;
  //   await nickNameInput.sendKeys(NickName);
  //   let PasswordInput = await driver.findElement(By.name("password"));
  //   await PasswordInput.sendKeys(Password);
  //   await driver.findElement(By.id("btnAuthLogin")).click();
  //   let btnLogout = await driver.findElement(By.className("_btn_18q0f_163"));
  //   await driver.wait(until.elementIsVisible(btnLogout), 5000);
  //   assert.strictEqual(await btnLogout.isDisplayed(), true, "Login Success");
  // });

  // after(async () => {
  //   await driver.quit();
  // });
});
