from flask import Flask, request, Response, send_from_directory
from werkzeug.datastructures import ImmutableMultiDict
import requests


app: Flask = Flask(__name__)

@app.get('/')
def index() -> Response:
  return send_from_directory('static', 'index.html')

# @app.get('/index.css')
# def get_css() -> Response:
#   return send_from_directory('static', 'index.css')

# @app.get('/index.js')
# def get_js() -> Response:
#   return send_from_directory('static', 'index.js')

@app.get('/<path:filename>')
def get_static_file(filename: str) -> Response:
  return send_from_directory('static', filename)


@app.get('/event/<string:event_id>')
def get_event_detail(event_id: str):
  return 'event' + event_id

@app.get('/venue/<string:venue_id>')
def get_venue_detail(venue_id: str):
  return 'venue' + venue_id

@app.get('/search')
def search_events():
  params: ImmutableMultiDict[str, str] = request.args
  
  return 'search event'


if __name__ == '__main__':
  app.run(debug=True)
