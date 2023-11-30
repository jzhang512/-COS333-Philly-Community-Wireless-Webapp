# ---------------------------------------------------------------------
# auth.py
# ---------------------------------------------------------------------

import os
import sys
import json
import requests
import flask
import oauthlib.oauth2
import database_req as db

# ---------------------------------------------------------------------
GOOGLE_DISCOVERY_URL = ( 
    'https://accounts.google.com/.well-known/openid-configuration')

GOOGLE_CLIENT_ID = os.environ['GOOGLE_CLIENT_ID']
GOOGLE_CLIENT_SECRET = os.environ['GOOGLE_CLIENT_SECRET']

client =  oauthlib.oauth2.WebApplicationClient(GOOGLE_CLIENT_ID)

AUTHORIZED_USERS = ['cos333pcw@gmail.com']
# ---------------------------------------------------------------------

def login():

    # Determine the URL for Google login.
    google_provider_cfg = requests.get(GOOGLE_DISCOVERY_URL).json()
    authorization_endpoint = (
        google_provider_cfg['authorization_endpoint'])

    # Construct the request URL for Google login, providing scopes
    # to fetch the user's profile data.
    request_uri = client.prepare_request_uri(
        authorization_endpoint,
        redirect_uri = flask.request.base_url + '/callback',
        scope=['openid', 'email', 'profile'],
    )

    #-------------------------------------------------------------------
    # For learning:
    # print('request_uri:', request_uri, file=sys.stderr)
    #-------------------------------------------------------------------

    # Redirect to the request URL.
    return flask.redirect(request_uri)

#-----------------------------------------------------------------------

def callback():

    # Get the authorization code that Google sent.
    code = flask.request.args.get('code')

    #-------------------------------------------------------------------
    # For learning:
    # print('code:', code, file=sys.stderr)
    #-------------------------------------------------------------------

    # Determine the URL to fetch tokens that allow the application to
    # ask for the user's profile data.
    google_provider_cfg = requests.get(GOOGLE_DISCOVERY_URL).json()
    token_endpoint = google_provider_cfg['token_endpoint']

    # Construct a request to fetch the tokens.
    token_url, headers, body = client.prepare_token_request(
        token_endpoint,
        authorization_response=flask.request.url,
        redirect_url=flask.request.base_url,
        code=code
    )

    #-------------------------------------------------------------------
    # For learning:
    # print('token_url:', token_url, file=sys.stderr)
    # print('headers:', headers, file=sys.stderr)
    # print('body:', body, file=sys.stderr)
    #-------------------------------------------------------------------

    # Fetch the tokens.
    token_response = requests.post(
        token_url,
        headers=headers,
        data=body,
        auth=(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET),
    )

    #-------------------------------------------------------------------
    # For learning:
    # print('token_response.json():', token_response.json(),
    #     file=sys.stderr)
    #-------------------------------------------------------------------

    # Parse the tokens.
    client.parse_request_body_response(
        json.dumps(token_response.json()))

    # Using the tokens, fetch the user's profile data,
    # including the user's Google profile image and email address.
    userinfo_endpoint = google_provider_cfg['userinfo_endpoint']
    uri, headers, body = client.add_token(userinfo_endpoint)

    #-------------------------------------------------------------------
    # For learning:
    # print('uri:', uri, file=sys.stderr)
    # print('headers:', headers, file=sys.stderr)
    # print('body:', body, file=sys.stderr)
    #-------------------------------------------------------------------

    userinfo_response = requests.get(uri, headers=headers, data=body)

    #-------------------------------------------------------------------
    # For learning:
    print('userinfo_response.json():', userinfo_response.json(),
     file=sys.stderr)
    #-------------------------------------------------------------------

    # Optional: Make sure the user's email address is verified.
    # if not userinfo_response.json().get('email_verified'):
        # message = 'User email not available or not verified by Google.'
        # return message, 400

    # Save the user profile data in the session.

    # flask.session['email'] = userinfo_response.json()['email']
    #flask.session['sub'] = userinfo_response.json()['sub']
    flask.session['name'] = userinfo_response.json()['name']
    #flask.session['given_name'] = (
    #    userinfo_response.json()['given_name'])
    #flask.session['family_name'] = (
    #    userinfo_response.json()['family_name'])
    #flask.session['picture'] = userinfo_response.json()['picture']
    #flask.session['email_verified'] = (
    #    userinfo_response.json()['email_verified'])
    #flask.session['locale'] = userinfo_response.json()['locale']

    # Check if the user's email is verified
    if userinfo_response.json().get('email_verified'):
        user_email = userinfo_response.json()['email']
        # Check if the user is authorized to access the admin page
        if db.is_authorized_user(user_email):
            # User is authorized, set session variables and redirect to admin page
            print("this ran")
            flask.session['email'] = user_email
            flask.session['name'] = userinfo_response.json()['name']
            # ... [set other session variables as needed] ...
            return flask.redirect(flask.url_for('admin'))
        else:
            # User is not authorized
            print("that ran")
            return flask.redirect(flask.url_for('unauthorized'))  # Redirect to an 'unauthorized' route
    else:
        # Email is not verified
        return 'User email not available or not verified by Google.', 400

#-----------------------------------------------------------------------

def logout():

    # Log out of the application.
    flask.session.clear()
    
    return flask.redirect(flask.url_for('index'))

#-----------------------------------------------------------------------

def logoutgoogle():
    # Log out of the application.
    flask.session.clear()

    # Prepare the Google logout URL with a redirect to your app's callback route.
    google_logout_url = 'https://mail.google.com/mail/u/0/?logout&hl=en'
    app_logout_callback_url = flask.url_for('logout_google_callback', _external=True)

    print(f'{google_logout_url}&continue={app_logout_callback_url}')
    # Redirect to Google logout with a callback to your app.
    return flask.redirect(f'{google_logout_url}&continue={app_logout_callback_url}')


#-----------------------------------------------------------------------

def authenticate():

    if 'email' not in flask.session:
        flask.abort(flask.redirect(flask.url_for('login')))

    return flask.session.get('email')
#-----------------------------------------------------------------------
def checkAuthenticate():

    return flask.session.get('email')

def getName():

    return flask.session.get('name')
