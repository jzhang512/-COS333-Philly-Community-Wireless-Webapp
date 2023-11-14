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

########################################################################
##########################   API Endpoints   ###########################
########################################################################

##############################   Read   ################################

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
        hotspot_id = review['pin_id']
        rating = review['stars']
        comment = review['text']
        time = review['time']
        database_req.add_user_review(hotspot_id, rating, comment, time)
        return flask.jsonify("Success")
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
