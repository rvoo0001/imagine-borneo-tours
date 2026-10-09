import io
from PIL import Image

def image_bytes():
    image = Image.new('RGB', (40, 30), 'green')
    output = io.BytesIO()
    image.save(output, format='PNG')
    return output.getvalue()

def animal(client, name='Proboscis monkey'):
    response = client.post('/animals/', json={'animal_name': name})
    assert response.status_code == 200, response.text
    return response.json()['animal_id']

def tour(client, animals=None):
    response = client.post('/tours/', json={'tour_name': 'River safari', 'tour_price': '850.00', 'tour_desc': 'A river journey', 'animals': animals or []})
    assert response.status_code == 200, response.text
    return response.json()['tour_id']

def test_authentication_and_logout(client):
    assert client.post('/animals/', json={'animal_name': 'Test'}).status_code == 401
    assert client.get('/contact/messages').status_code == 401
    assert client.put('/content/', json={'version': 0, 'values': {}}).status_code == 401
    assert client.post('/admin/login', json={'password': 'incorrect'}).status_code == 401
    assert client.post('/admin/login', json={'password': 'local-test-password-only'}).status_code == 200
    assert client.get('/admin/session').status_code == 200
    assert client.post('/admin/logout').status_code == 200
    assert client.get('/admin/session').status_code == 401

def test_tampered_cookie_and_cross_origin(admin):
    assert admin.post('/animals/', headers={'Origin': 'https://untrusted.example'}, json={'animal_name': 'Test'}).status_code == 403
    admin.cookies.clear()
    admin.cookies.set('ibt_session', 'forged-token')
    assert admin.get('/admin/session').status_code == 401

def test_login_rate_limit(client):
    for _ in range(10):
        assert client.post('/admin/login', json={'password': 'incorrect'}).status_code == 401
    assert client.post('/admin/login', json={'password': 'incorrect'}).status_code == 429

def test_validation_and_duplicate_name(admin):
    assert admin.post('/animals/', json={'animal_name': '   '}).status_code == 422
    animal(admin)
    assert admin.post('/animals/', json={'animal_name': 'Proboscis monkey'}).status_code == 409
    assert admin.post('/tours/', json={'tour_name': 'Invalid', 'tour_price': '-1'}).status_code == 422

def test_tour_atomic_associations_and_nullable_description(admin):
    first = animal(admin)
    second = animal(admin, 'Orangutan')
    tid = tour(admin, [{'animal_id': first, 'sighting_probability': 0.5}])
    result = admin.patch(f'/tours/{tid}', json={'tour_desc': None, 'animals': [{'animal_id': second, 'sighting_probability': 0.7}]})
    assert result.status_code == 200
    assert result.json()['tour_desc'] is None
    assert result.json()['animals'][0]['animal_id'] == second
    result = admin.patch(f'/tours/{tid}', json={'tour_name': 'Should rollback', 'animals': [{'animal_id': 9999, 'sighting_probability': 0.5}]})
    assert result.status_code == 404
    assert admin.get(f'/tours/{tid}').json()['tour_name'] == 'River safari'
    assert admin.patch(f'/tours/{tid}', json={'animals': []}).json()['animals'] == []

def test_image_upload_cover_and_cascade_delete(admin):
    aid = animal(admin)
    tid = tour(admin, [{'animal_id': aid, 'sighting_probability': 0.5}])
    upload = admin.post(f'/tours/{tid}/images/upload', files={'file': ('test.png', image_bytes(), 'image/png')})
    assert upload.status_code == 200
    image_id = upload.json()['cover_image']['image_id']
    assert admin.get(upload.json()['cover_image']['url']).status_code == 200
    assert admin.delete(f'/images/{image_id}').status_code == 400
    assert admin.delete(f'/animals/{aid}').status_code == 400
    result = admin.delete(f'/tours/{tid}/images/{image_id}')
    assert result.status_code == 200
    assert result.json()['cover_image'] is None
    assert admin.delete(f'/tours/{tid}').status_code == 200
    upload = admin.post(f'/animals/{aid}/images/upload', files={'file': ('test.png', image_bytes(), 'image/png')})
    assert upload.status_code == 200
    assert admin.delete(f'/animals/{aid}').status_code == 200

def test_delete_tour_with_images(admin):
    tid = tour(admin)
    assert admin.post(f'/tours/{tid}/images/upload', files={'file': ('image.png', image_bytes(), 'image/png')}).status_code == 200
    assert admin.delete(f'/tours/{tid}').status_code == 200

def test_invalid_upload(admin):
    assert admin.post('/images/upload', files={'file': ('fake.png', b'<script>bad</script>', 'image/png')}).status_code == 400

def test_content_persistence_conflicts_and_url_validation(admin):
    first = admin.put('/content/', json={'version': 0, 'values': {'home.title': 'Updated heading'}})
    assert first.status_code == 200
    assert admin.get('/content/').json()['values']['home.title'] == 'Updated heading'
    assert admin.put('/content/', json={'version': 0, 'values': {}}).status_code == 409
    assert admin.put('/content/', json={'version': 1, 'values': {'brand.logo_url': 'javascript:bad()'}}).status_code == 422

def test_enquiry_storage_and_admin_inbox(client):
    payload = {'name': 'QA Visitor', 'email': 'qa@example.invalid', 'subject': 'Local QA', 'message': 'A test enquiry stored only in the isolated test database.'}
    assert client.post('/contact/messages', json={**payload, 'email': 'bad'}).status_code == 422
    assert client.post('/contact/messages', json=payload).status_code == 201
    assert client.get('/contact/messages').status_code == 401
    client.post('/admin/login', json={'password': 'local-test-password-only'})
    assert client.get('/contact/messages').json()[0]['subject'] == 'Local QA'
