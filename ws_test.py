from flask import Flask, Blueprint, send_from_directory, send_file
from flask_sockets import Sockets
from gevent import util
import logging

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


if __name__ == "__main__":
    from gevent import pywsgi
    from geventwebsocket.handler import WebSocketHandler

    server = pywsgi.WSGIServer(('0', 5000), app, handler_class=WebSocketHandler, log=app.logger)
    app.logger.setLevel(logging.DEBUG)
    app.debug = True
    server.serve_forever()
