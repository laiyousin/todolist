from flask import Flask, abort, jsonify, request, url_for
from flask_jwt_extended import JWTManager, create_access_token, jwt_required
from flask_restful import Api, Resource, reqparse, fields, marshal
from flask_httpauth import HTTPBasicAuth
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.sql import func
from flask_migrate import Migrate
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
api = Api(app)

# Set SQLAlchemy config and connect with MySQL
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:password@localhost/todolist'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['MONGO_URI'] = ''
app.config['JWT_SECRET_KEY'] = 'super-secret'

db = SQLAlchemy(app)
migrate = Migrate(app, db)
auth = HTTPBasicAuth()
jwt = JWTManager(app)

# Database
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(255), nullable=False, unique=True)
    password = db.Column(db.String(255), nullable=False)
    tasks = db.relationship('Task', backref='user', lazy=True)

    def __repr__(self):
        return f"<User(id={self.id}, username={self.username})>"
    
class Task(db.Model):
    __tablename__ = 'tasks'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.String(255), nullable=True)
    done = db.Column(db.Boolean, default=False)
    create_at = db.Column(db.TIMESTAMP, server_default=func.now())
    update_at = db.Column(db.TIMESTAMP, server_default=func.now(), onupdate=func.now())
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    def __repr__(self):
        return f"<Task(id={self.id}, title={self.title})>"

task_fields = {
    'title': fields.String,
    'description': fields.String,
    'done': fields.Boolean,
    'create_at': fields.DateTime,
    'update_at': fields.DateTime,
    'url': fields.Url('task')
}

user_fields = {
    'id': fields.Integer,
    'username': fields.String,
}

# User Registeration
class UserRegistrationAPI(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('username', type=str, required=True,
                                   help='No username provided', location='json')
        self.reqparse.add_argument('password', type=str, required=True,
                                   help='No password provided', location='json')
        super(UserRegistrationAPI, self).__init__()
    
    def post(self):
        args = self.reqparse.parse_args()
        if User.query.filter_by(username=args['username']).first():
            return {'message': 'User already exists'}, 400
        hashed_password = generate_password_hash(args['password'], method='pbkdf2:sha256')
        new_user = User(username=args['username'], password=hashed_password)
        db.session.add(new_user)
        db.session.commit()
        return {'message': 'User registered successfully'}, 201
    
# User Login
class UserLoginAPI(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('username', type=str, required=True,
                                   help='No username provided', location='json')
        self.reqparse.add_argument('password', type=str, required=True,
                                   help='No password provided', location='json')
        super(UserLoginAPI, self).__init__()

    def post(self):
        args = self.reqparse.parse_args()
        user = User.query.filter_by(username=args['username']).first()
        
        if not user:
            return {'message': 'No User'}, 401
        
        if not check_password_hash(user.password, args['password']):
            return {'message': 'Incorrect password'}, 401
        
        access_token = create_access_token(identity={'username': user.username})
        return {'access token': access_token}, 200

# User List API
class UsersListAPI(Resource):
    def get(self):
        users = User.query.all()
        return {'users': [marshal(user, user_fields) for user in users]}
    
# Task APIs
class TaskListAPI(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('title', type=str, required=True,
                                   help='No task title provided', location='json')
        self.reqparse.add_argument('description', type=str, default='', location='json')
        self.reqparse.add_argument('user_id', type=int, required=True,
                                   help='No user_id provided', location='json')
        super(TaskListAPI, self).__init__()

    def get(self):
        tasks = Task.query.all()
        return { 'tasks': [marshal(task, task_fields) for task in tasks]}

    def post(self):
        args = self.reqparse.parse_args()
        task = Task(title=args['title'], description=args['description'], user_id=args['user_id'])
        db.session.add(task) # generate command
        db.session.commit() # execute command
        return { 'task': marshal(task, task_fields) }, 201

class TaskAPI(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('title', type=str, location='json')
        self.reqparse.add_argument('description', type=str, location='json')
        self.reqparse.add_argument('done', type=bool, location='json')
        super(TaskAPI, self).__init__()
    
    def get(self, id):
        task = Task.query.get(id)
        if not task:
            abort(404)
        return { 'task': marshal(task, task_fields) }

    def put(self, id):
        task = Task.query.get(id)
        if not task:
            abort(404)
        args = self.reqparse.parse_args()
        for k, v in args.items():
            if v is not None:
                setattr(task, k, v)
        db.session.commit()
        return { 'task': marshal(task, task_fields) }

    def delete(self, id):
        task = Task.query.get(id)
        if not task:
            abort(404)
        db.session.delete(task)
        db.session.commit()
        return { 'result': True }
    
class UserTaskListAPI(Resource):
    def get(self, user_id):
        user = User.query.get(user_id)
        if not user:
            abort(404)
        tasks = Task.query.filter_by(user_id=user.id).all()
        return {'tasks': [marshal(task, task_fields) for task in tasks]}
    
class ClearDatabaseAPI(Resource):
    def post(self):
        meta = db.metadata
        for table in reversed(meta.sorted_tables):
            print(f'Clearing table {table}')
            db.session.execute(table.delete())
        db.session.commit()
        return {'result': 'All tables cleared'}

api.add_resource(UserRegistrationAPI, '/register', endpoint='register')
api.add_resource(UserLoginAPI, '/login', endpoint='login')
api.add_resource(TaskListAPI, '/tasks', endpoint='tasks')
api.add_resource(TaskAPI, '/tasks/<int:id>', endpoint='task')
api.add_resource(UsersListAPI, '/users', endpoint='users')
api.add_resource(UserTaskListAPI, '/users/<int:user_id>/tasks', endpoint='user_tasks')
api.add_resource(ClearDatabaseAPI, '/clear', endpoint='clear')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)