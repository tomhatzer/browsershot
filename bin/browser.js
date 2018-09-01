const puppeteer = require('puppeteer');

const path = require('path');

const request = JSON.parse(process.argv[2]);

const getOutput = async (page, request) => {
    let output;

    if (request.action == 'evaluate') {
        output = await page.evaluate(request.options.pageFunction);

        return output;
    }

    output = await page[request.action](request.options);

    return output.toString('base64');
};

const removeUserDataDirectory = async() => {
    if(request.options && request.options.removeUserDataDirOnDone) {
        
    }
};

const callChrome = async () => {
    let browser;
    let page;
    let output;

    try {
	    let launchOptions = {
            ignoreHTTPSErrors: request.options.ignoreHttpsErrors,
            executablePath: request.options.executablePath,
            args: request.options.args || []
        };
        
        if(request.options && request.options.userDataDir) {
	        launchOptions.userDataDir = request.options.userDataDir;
        }
        
        browser = await puppeteer.launch(launchOptions);

        page = await browser.newPage();

        if (request.options && request.options.dismissDialogs) {
            page.on('dialog', async dialog => {
                await dialog.dismiss();
            });
        }

        if (request.options && request.options.userAgent) {
            await page.setUserAgent(request.options.userAgent);
        }

        if (request.options && request.options.emulateMedia) {
            await page.emulateMedia(request.options.emulateMedia);
        }

        if (request.options && request.options.viewport) {
            await page.setViewport(request.options.viewport);
        }

        if (request.options && request.options.extraHTTPHeaders) {
            await page.setExtraHTTPHeaders(request.options.extraHTTPHeaders);
        }

        if (request.options && request.options.timeout) {
            await page.setDefaultNavigationTimeout(request.options.timeout);
        }

        const requestOptions = {};

        if (request.options && request.options.networkIdleTimeout) {
            requestOptions.waitUntil = 'networkidle';
            requestOptions.networkIdleTimeout = request.options.networkIdleTimeout;
        } else if (request.options && request.options.waitUntil) {
            requestOptions.waitUntil = request.options.waitUntil;
        }

        await page.goto(request.url, requestOptions);

        if (request.options && request.options.clicks) {
            for (let i = 0, len = request.options.clicks.length; i < len; i++) {
                let clickOptions = request.options.clicks[i];
                await page.click(clickOptions.selector, {
                    'button': clickOptions.button,
                    'clickCount': clickOptions.clickCount,
                    'delay': clickOptions.delay,
                });
            }
        }

        if (request.options.delay) {
            await page.waitFor(request.options.delay);
        }

        if (request.options.selector) {
            const element = await page.$(request.options.selector);
            if(element === null) {
                throw { type: 'ElementNotFound' };
            }

            request.options.clip = await element.boundingBox();
        }

        if (request.options.function) {
            let functionOptions = {
                polling: request.options.functionPolling,
                timeout: request.options.functionTimeout || request.options.timeout
            };
            await page.waitForFunction(request.options.function, functionOptions);
        }

        output = await getOutput(page, request);

        if (!request.options.path) {
            console.log(output);
        }

        await browser.close();
        
        await.removeUserDataDirectory();
    } catch (exception) {
        if (browser) {
            await browser.close();
        }
        
        await.removeUserDataDirectory();

        console.error(exception);

        if(exception.type === 'ElementNotFound') {
            process.exit(2);
        }

        process.exit(1);
    }
};

callChrome();
