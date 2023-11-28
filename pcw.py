# ---------------------------------------------------------------------
# Contains all flask code.
# ---------------------------------------------------------------------

import os
import flask
import database_req
import auth

# ---------------------------------------------------------------------
app = flask.Flask(__name__)

app.secret_key = os.environ['APP_SECRET_KEY']
# ---------------------------------------------------------------------

# Routes for authentication
@app.route('/login', methods=['GET'])
def login():
    return auth.login()

@app.route('/login/callback', methods=['GET'])
def callback():
    return auth.callback()

@app.route('/admin/logout', methods=['GET'])
def logout():
    return auth.logout()

@app.route('/admin/logoutgoogle', methods=['GET'])
def logoutgoogle():
    return auth.logoutgoogle()

# ---------------------------------------------------------------------

@app.route('/', methods=['GET'])
def index():
    html_code = flask.render_template('index.html')
    response = flask.make_response(html_code)
    return response

# @app.route('/search', methods=['GET'])
# def search():



@app.route('/admin/<path:admin_path>', methods=['GET'])
@app.route('/admin', methods=['GET'])
@app.route('/admin/', methods=['GET'])
def admin(admin_path=None):
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
        print(reviews)
        return flask.jsonify(reviews)

    except Exception as ex:
        print(ex)
        return flask.jsonify("Database Error")

#############################   Create   ###############################


@app.route('/api/create_hotspots', methods=['POST'])
def create_hotspots():
    try:
        hotspots = flask.request.json
        print(hotspots)
        database_req.create_hotspots(hotspots)
        return flask.jsonify("Success")
    except database_req.InvalidFormat as ex:
        print(ex)
        return flask.jsonify(f"Error: {ex}")
    except Exception as ex:
        print(ex)
        return flask.jsonify("Error")


@app.route('/api/create_tags', methods=['POST'])
def create_tags():
    try:
        tags = flask.request.json
        print(tags)
        database_req.add_tags(tags)
        return flask.jsonify("Success")
    except database_req.InvalidFormat as ex:
        print(ex)
        return flask.jsonify(f"Error: {ex}")
    except Exception as ex:
        print(ex)
        return flask.jsonify("Error")


@app.route('/api/publish_review', methods=['POST'])
def publish_review():
    try:
        review = flask.request.json
        print(review)
        database_req.add_user_review(review)
        return flask.jsonify("Success")
    except ValueError as ex:
        print(ex)
        return flask.jsonify(f"Error: hotspot_id and rating must be ints.")
    except database_req.InvalidFormat as ex:
        print(ex)
        return flask.jsonify(f"Error: {ex}")
    except Exception as ex:
        print(ex)
        return flask.jsonify("Error")

#############################   Modify   ###############################


@app.route('/api/modify_hotspots', methods=['POST'])
def modify_hotspots():
    try:
        hotspots = flask.request.json
        print(hotspots)
        database_req.update_hotspots(hotspots)
        return flask.jsonify("Success")
    except database_req.InvalidFormat as ex:
        print(ex)
        return flask.jsonify(f"Error: {ex}")
    except Exception as ex:
        print(ex)
        return flask.jsonify("Error")


@app.route('/api/modify_hotspots_tags', methods=['POST'])
def modify_hotspots_tags():
    try:
        hotspots = flask.request.json
        print(hotspots)
        database_req.update_hotspot_tags(hotspots)
        return flask.jsonify("Success")
    except database_req.InvalidFormat as ex:
        print(ex)
        return flask.jsonify(f"Error: {ex}")
    except Exception as ex:
        print(ex)
        return flask.jsonify("Error")


@app.route('/api/approve_review', methods=['POST'])
def approve_review():
    pin = flask.request.args.get("id", default="")
    try:
        pin = int(pin)
        database_req.approve_review(pin)
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
        database_req.reject_review(pin)
        return flask.jsonify("Success")
    except ValueError as ex:
        print(ex)
        return flask.jsonify("Invalid Arg, not an int")
    except Exception as ex:
        print(ex)
        return flask.jsonify("Database Error")
