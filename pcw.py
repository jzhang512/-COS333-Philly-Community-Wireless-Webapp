import flask

import database


app=flask.Flask(__name__)


@app.route('/', methods=['GET'])
def index():
    try:
        pins = database.get_pins()
    except Exception as ex:
        print(Exception)
        html_code = flask.render_template('error.html')
        response = flask.make_response(html_code)

        return response
    
    html_code = flask.render_template('index.html', pins=pins)
    response = flask.make_response(html_code)

    return response