import flask

import database_req


app=flask.Flask(__name__)


@app.route('/', methods=['GET'])
def index():
    html_code = flask.render_template('index.html')
    response = flask.make_response(html_code)

    return response


@app.route('/api/hotspots', methods=['GET'])
def hotspots():
    try:
        pins = database_req.get_pins
    except Exception as ex:
        print(ex)
        return flask.jsonify("Database Error")
    
    return flask.jsonify(pins)


@app.route('/api/reviews', methods=['GET'])
def pin():
    pin = flask.request.args.get("id")
    try:
        pin = int(pin)
    except ValueError as ex:
        return flask.jsonify("Invalid Arg, not an int")
    
    try:
        reviews = database_req.get_reviews(pin)
    except Exception as ex:
        print(ex)
        return flask.jsonify("Database Error")

    return flask.jsonify(reviews)