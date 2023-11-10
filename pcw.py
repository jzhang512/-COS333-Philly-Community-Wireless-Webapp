# ---------------------------------------------------------------------
# Contains all flask code.
# ---------------------------------------------------------------------
import flask
import database_req

app = flask.Flask(__name__)


@app.route('/', methods=['GET'])
def index():
    html_code = flask.render_template('index.html')
    response = flask.make_response(html_code)
    return response


@app.route('/admin', methods=['GET'])
def admin():
    html_code = flask.render_template('admin.html')
    response = flask.make_response(html_code)
    return response


@app.route('/api/hotspots', methods=['GET'])
def hotspots():
    try:
        pins = database_req.get_pins()
    except Exception as ex:
        print(ex)
        return flask.jsonify("Database Error")

    return flask.jsonify(pins)


@app.route('/api/tags', methods=['GET'])
def tags():
    try:
        tags = database_req.get_tags_by_category()
    except Exception as ex:
        print(ex)
        return flask.jsonify("Database Error")

    return flask.jsonify(tags)


@app.route('/api/reviews', methods=['GET'])
def review_pin():
    pin = flask.request.args.get("id", default="")
    try:
        pin = int(pin)
        reviews = database_req.get_reviews_by_hotspot(pin)
        return flask.jsonify(reviews)

    except ValueError as ex:
        print(ex)
        return flask.jsonify("Invalid Arg, not an int")
    except Exception as ex:
        print(ex)
        return flask.jsonify("Database Error")


@app.route('/api/pending_reviews', methods=['GET'])
def pending_reviews():
    try:
        reviews = database_req.get_pending_reviews()
        return flask.jsonify(reviews)

    except Exception as ex:
        print(ex)
        return flask.jsonify("Database Error")


@app.route('/api/publish_review', methods=['POST'])
def publish_review():
    try:
        review = flask.request.get_json()
        hotspot_id = review['pin_id']
        rating = review['stars']
        comment = review['text']
        time = review['time']
        database_req.add_user_review(hotspot_id, rating, comment, time)
    except Exception as ex:
        print(ex)
        return flask.jsonify("Error")


@app.route('/api/approve_review', methods=['POST'])
def approve_review():
    pin = flask.request.args.get("id", default="")
    try:
        pin = int(pin)
        # database_req.approve_review(pin)
        print("approve", pin)
        return flask.jsonify("Success")
    except ValueError as ex:
        print(ex)
        return flask.jsonify("Invalid Arg, not an int")
    except Exception as ex:
        print(ex)
        return flask.jsonify("Database Error")


@app.route('/api/reject_review', methods=['POST'])
def reject_review():
    pin = flask.request.args.get("id", default="")
    try:
        pin = int(pin)
        print("reject", pin)
        # database_req.reject_review(pin)
        return flask.jsonify("Success")
    except ValueError as ex:
        print(ex)
        return flask.jsonify("Invalid Arg, not an int")
    except Exception as ex:
        print(ex)
        return flask.jsonify("Database Error")
