import flask

import database


app=flask.Flask(__name__)


@app.route('/', methods=['GET'])
def index():
    try:
        pins = database.get_pins()
        tags = database.get_tags()
    except Exception as ex:
        print(ex)
        html_code = flask.render_template('error.html')
        return flask.make_response(html_code)
    
    html_code = flask.render_template('index.html', pins=pins, tags=tags)
    response = flask.make_response(html_code)

    return response


@app.route('/pin', methods=['GET'])
def pin():
    pin = flask.request.args.get("id")
    try:
        pin = int(pin)
    except ValueError as ex:
        return flask.jsonify("Invalid Arg, not an int")
    try:
        reviews = database.get_reviews(pin)
    except Exception as ex:
        print(ex)
        return flask.jsonify("Database Error")

    return flask.jsonify(reviews)