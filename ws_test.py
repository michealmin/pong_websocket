
from flask_sockets import Sockets
from werkzeug.serving import run_with_reloader
from werkzeug.debug import DebuggedApplication
from flask import Flask, Blueprint, send_file
from gevent import util
import logging

logging.basicConfig(level=logging.DEBUG)
LOG = logging.getLogger('wstest')
LOG.setLevel(logging.DEBUG)


html = Blueprint(r'html', __name__)
ws = Blueprint(r'ws', __name__)


@html.route('/')
def hello():
    return send_file('phaser3_test.html')

@ws.route('/echo')
def echo_socket(socket):
    # import gevent
    # def test():
    #   while True:
    #     gevent.sleep(1)
    #     socket.send('greenlet')
    #
    # t = gevent.spawn(test)
    # t.start()
    while not socket.closed:
        message = socket.receive()
        socket.send(message)

app = Flask(__name__, static_url_path='/static')
app.debug = True

sockets = Sockets(app)

app.register_blueprint(html, url_prefix=r'/')
sockets.register_blueprint(ws, url_prefix=r'/test')

@run_with_reloader
def run_server():
    from gevent import pywsgi
    from geventwebsocket.handler import WebSocketHandler
    http_server = pywsgi.WSGIServer(('', 5000), DebuggedApplication(app), handler_class=WebSocketHandler, log=app.logger)
    http_server.serve_forever()


if __name__ == "__main__":
    # LOG.debug('main=-==-=-=-=-=-=-=-=-=')
    run_server()
    test = 1
    from gevent import pywsgi
    from geventwebsocket.handler import WebSocketHandler
    # print(app.logger)
    # print(app.logger.write)
    # print(app.logger.log)
    app.debug = True
    app.logger.setLevel(logging.DEBUG)

    server = pywsgi.WSGIServer(('0', 5000), app, handler_class=WebSocketHandler, log=app.logger)


    server.serve_forever()
