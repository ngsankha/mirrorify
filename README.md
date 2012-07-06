Mirrorify
=========
Your original sites, well and good until your server dies! Use Mirrorify to set up a mirrors of your sites and open them with a single URL. If your server is fine, awesome! You get your original site. If your server is down Mirrorify automatically gives you the the backup site.

Requirements
------------
 * [Node.js](http://nodejs.org)
 * [Redis](http://redis.io)

Installing
----------
The details of installing Mirrorify is given [here](https://github.com/sankha93/mirrorify/wiki/Installing) in details.

Using Mirrorify
---------------
Once you are done installing Mirrorify, start it using

    node mirrorify.js

This will start up the Mirrorify server on port 8000 by default.  

Then you can ping `http://localhost:8000/create` with the POST data in the following JSON format:

    {
     'timeout': 2,
     'url1': 'http://mysite1.com',
     'url2': 'http://mysite2.com'
    }

Here `timeout` is the time to wait in seconds for response from your original site, `url1` is the URL of your site and `url2` is the site to fall back on in case the server is down.  
You will get a JSON coded response

    {
     'url': '/abcdef'
    }

Here the `url` parameter specifies the string to append after the hostname to get back the site.  

Then anytime, just fetch the URL `http://localhost:8000/abcdef` and you will recieve a JSON coded string

    {
     'url': 'http://mysite1.com'
    }

Here `url` parameter specifies the URL of the website that you should probably visit. Mirrorify will automatically detect if the first server is behaving normally, without problems, then it will give the URL of that site, otherwise it gives you back the URL of the second site to fall back on!  

So one URL but get you the site that is working best! Kind of rad!  

Finally
-------
Mirrorify is currently implemented in the form of an API and it does not have a frontend to it. Maybe I will add a frontend website to create single URLs for mirrors in the future.  

Till then fork and hack on Mirrorify and send me pull requests. Or file an issue if you have a problem.