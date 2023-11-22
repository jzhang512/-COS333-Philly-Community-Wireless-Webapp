# ---------------------------------------------------------------------
# Acts like the runserver.
# Port is not hardcoded but use 5000
# ---------------------------------------------------------------------

from argparse import ArgumentParser

import sys

import pcw


def handle_args():
    """
    Handle and return arguments using ArgumentParser.
    """
    parser = ArgumentParser(prog=sys.argv[0],
                            description="Registrar application: "
                                        "show overviews of classes",
                            allow_abbrev=False)
    parser.add_argument("port", default="", type=int,
                        help="the port at which the server should "
                             "listen")
    return vars(parser.parse_args())['port']


def main():
    port = handle_args()

    # TODO: dispose at close of application
    try:
        pcw.app.run(host='0.0.0.0', port=port, debug=True, 
        ssl_context=('cert.pem', 'key.pem'))
    except Exception as ex:
        print(sys.argv[0] + ": " + str(ex), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
