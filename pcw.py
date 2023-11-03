# ---------------------------------------------------------------------
# Contains all flask code.
# ---------------------------------------------------------------------
import flask

import database_req


app = flask.Flask(__name__, static_folder='images', template_folder='.')


@app.route('/', methods=['GET'])
def index():

    # build the html code
    html_code = flask.render_template('index.html')
    # print(html_code)
    response = flask.make_response(html_code)
    return response


@app.route('/info', methods=['GET'])
def info():
    try:
        curr_id = flask.request.args.get("id")
        index = int(curr_id)-1
        pin = database_req.get_pins()
        # print(pin)
        tags = database_req.get_tags()
        reviews = database_req.get_reviews(int(curr_id))
        # print(reviews)
        html_code = flask.render_template(
            'templates/popup.html', pins=[pin[index]], tags=[tags[index]], reviews=reviews)

        return html_code

    except ValueError as ex:
        return flask.jsonify("Invalid Arg, not an int")
    except Exception as ex:
        print(ex)
        return flask.jsonify("Database Error")


@app.route('/get_all', methods=['GET'])
def get_all():

    html_code = flask.render_template('index.html')
    response = flask.make_response(html_code)

    return response


@app.route('/api/hotspots', methods=['GET'])
def hotspots():
    try:
        pins = database_req.get_pins()
    except Exception as ex:
        print(ex)
        html_code = flask.render_template('templates/error.html')
        return flask.make_response(html_code)
    
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
