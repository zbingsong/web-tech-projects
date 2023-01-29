from flask import Flask, render_template, request
from werkzeug.datastructures import ImmutableMultiDict


app: Flask = Flask(__name__)

@app.get('/')
def index() -> str:
  return render_template('index.html')

@app.get('/event/<str: event_id>')
def get_event_detail(event_id: str):
  return ''

@app.get('/venue/<str: venue_id>')
def get_event_detail(venue_id: str):
  return ''

@app.post('/search')
def search_events():
  data: ImmutableMultiDict = request.form
  return ''


if __name__ == '__main__':
  app.run(debug=True)
