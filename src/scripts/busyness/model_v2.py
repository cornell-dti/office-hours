import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from sklearn.metrics import mean_squared_error
import tensorflow as tf
import firebase_admin
from firebase_admin import firestore
from google.cloud.firestore_v1.base_query import FieldFilter, Or, And
import datetime
import csv
import os.path

# fix random seed for reproducibility
tf.random.set_seed(7)

#question might actually not matter at all. we need inputs that matter for the whole session, not an individual question
#what the frontend will call: at [session start time to end time] on [day of week] for [course], what is the estimated wait time? 
# could add extra things like tags, number of TAs. things you know BEFORE a session starts.
# x = [startHour, startMin, endHour, endMin, courseName, month, dayOfWeek]
# y = [wait time] (this is a supervised learning problem. use the waitTimeBeforeAssignment col in the df )
# maybe have a thing where if the prediction date is too far off we just do a uniform distribution cause what's the point in calling the model



def get_real_data():
    # only do this if the file doesn't alr exist
    
    if os.path.isfile('oberlin_data.csv'):
        print('data already exists')
        return
    cred_obj = firebase_admin.credentials.ApplicationDefault()
    default_app = firebase_admin.initialize_app(cred_obj, {
        'databaseURL':'https://queue-me-in-oberlin-470213.firebaseio.com'
        })

    db = firestore.client()

    print("Firebase initalized :D")

    start = datetime.datetime(2025, 8, 18)
    questions = (
        db.collection('questions')
        .where(filter=FieldFilter("timeEntered", ">=", start))
        .order_by('timeEntered', 'DESCENDING')
        .limit(50) # to be safe for now
        .stream()
    )


    
    data = []
    for doc in questions:
        #here save into csv
        docDict = doc.to_dict()
        sessionId:str = docDict['sessionId']
        session_ref = db.collection("sessions").document(sessionId).get()
        docDict['startTime'] = session_ref.get('startTime')
        docDict['endTime'] = session_ref.get('endTime')

        data.append(docDict)
        
    with open('oberlin_data.csv', 'w', newline='') as csvfile:
        fieldnames = ['answererId', 'askerId', 'content', 'position','primaryTag', 'secondaryTag', 'sessionId', 'status', 'timeAddressed', 'timeAssigned', 'timeEntered', 'wasNotified','taNew','studentNew','location', 'answererLocation','isVirtual', 'startTime','endTime']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)





def load_data(file_path):
    """Load and preprocess data from CSV file"""
    df = pd.read_csv(file_path)
    
    #There shouldn't really be missing values, but just in case we can drop.
    df.dropna(subset=['startTime', 'endTime', 'timeAssigned', 'timeEntered'], inplace=True)  # Remove rows with missing values
    df['startTime'] = pd.to_datetime(df['startTime'], format="mixed")
    df['endTime'] = pd.to_datetime(df['endTime'],format="mixed")
    df['timeAssigned'] = pd.to_datetime(df['timeAssigned'])
    df['timeEntered'] = pd.to_datetime(df['timeEntered'])
    df['month'] = df['startTime'].dt.month
    df['day'] = df['startTime'].dt.dayofweek
    df['startHour'] = df['startTime'].dt.hour
    df['startMin'] = df['startTime'].dt.minute
    df['endHour'] = df['endTime'].dt.hour
    df['endMin'] = df['endTime'].dt.minute
    # df['timeAssigned'] = df['timeAssigned'].dt.total_seconds()
    # df['timeEntered'] = df['timeEntered'].dt.total_seconds()
    
    df['timeWaiting'] = df['timeAssigned'] - df['timeEntered']
    # Drop negative wait times, that should never happen
    df['timeWaiting'] = df['timeWaiting'].dt.total_seconds()
    df = df.drop(df.index[df['timeWaiting'] < 0])
 

    df = df[['timeAssigned','timeEntered','month','day','startHour','startMin','endHour','endMin','timeWaiting']]
    #possibly add location and some preprocessing, if location starts with https or is Online or NA its a virtual/hybrid session
    df = df.sort_values('timeEntered')
    print(df)
    print(len(df))
    print("-----------------")

    return df


def create_dataset(dataset, look_back=1):
	dataX, dataY = [], []
	for i in range(len(dataset)-look_back-1):
		a = dataset[i:(i+look_back), len(dataset[0] - 1)]
		dataX.append(a)
		dataY.append(dataset[i + look_back, len(dataset[0] - 1)])
	return np.array(dataX), np.array(dataY)


def main():
    """Run the vanilla LSTM pipeline"""
    get_real_data()

    # Load data
    df = load_data('oberlin_data.csv')

    df = df[['month', 'day', 'startHour', 'startMin', 'endHour', 'endMin', 'timeWaiting']]

    # Check if we have enough data
    if len(df) < 10:
        print("Not enough data to create sequences.")
        return
    #return a uniform prediction here


    #do LSTM stuff
    dataset = df.to_numpy('float32')
    X = df[['month', 'day', 'startHour', 'startMin', 'endHour', 'endMin']].to_numpy(dtype=np.float32)
    y = df[['timeWaiting']].to_numpy(dtype=np.float32)
    scaler_X = MinMaxScaler()
    scaler_y = MinMaxScaler()

    X_scaled = scaler_X.fit_transform(X)
    y_scaled = scaler_y.fit_transform(y)
    # split into train and test sets

    X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y_scaled, test_size=0.2, shuffle=False)
    print(f"after split, X_train: {len(X_train)}, X_test: {len(X_test)}, y_train: {len(y_train)}, y_test:{len(y_test)}")
    # Reshape X for LSTM: (samples, timesteps, features)
    # if you treat each row as one timestep (no sequences yet), timesteps=1
    X_train = np.reshape(X_train, (X_train.shape[0], 1, X_train.shape[1]))
    X_test = np.reshape(X_test, (X_test.shape[0], 1, X_test.shape[1]))

    print("X_train:", X_train.shape)
    print("y_train:", y_train.shape)
    print("X_test:", X_test.shape)
    print("y_test:", y_test.shape)

    model = Sequential([
    LSTM(50, activation='relu', input_shape=(X_train.shape[1], X_train.shape[2])),
    Dense(1)
    ])

    model.compile(optimizer='adam', loss='mse')
    model.fit(X_train, y_train, epochs=100, batch_size=32, validation_split=0.2, verbose=0)

    y_pred = model.predict(X_test)
    print(f"y_pred shape {y_pred.shape}")

    #invert the scale for interpretability
    y_test = scaler_y.inverse_transform(y_test)
    y_pred = scaler_y.inverse_transform(y_pred)

    predictions = pd.DataFrame({'Actual': y_test.flatten(), 'Predicted': y_pred.flatten()})
    print(predictions)

    loss = model.evaluate(X_test, y_test)
    print(f'Test loss?? idk: {loss}')

    loss = model.evaluate(y_pred, y_test)
    print(f'real Test loss?? maybe: {loss}')

    testScore = np.sqrt(mean_squared_error(y_test, y_pred))
    print('Test RMSE: %.2f RMSE' % (testScore))


    #split train/test so past is always used to predict future. 
    # test data needs to be unique?? bc what if i have same sessions but two different questions with different wait times - the "truth" would be the average right?
    # or maybe it doesn't matter? whatever estimate minimizes the mean squared error <- going with this for now
    
    # X = df[['month', 'day', 'startHour', 'startMin', 'endHour', 'endMin']]
    # y = df['timeWaiting']  

    # X_train, X_test, y_train, y_test = train_test_split(X,y, test_size=0.2, shuffle=False)
    # print(f"after split, X_train: {len(X_train)}, X_test: {len(X_test)}, y_train: {len(y_train)}, y_test:{len(y_test)}")

    # regr = MLPRegressor(random_state=1, max_iter=2000, tol=0.1)
    # regr.fit(X_train, y_train)
    # y_pred = regr.predict(X_test)
    # predictions = pd.DataFrame({'Actual': y_test, 'Predicted': y_pred})
    # print(predictions)
    # score = regr.score(X_test, y_test)
    # print("R-squared Score:", score)



     # normalizing probably doesn't make sense (you cant normalize a month)
    # model = LinearRegression()
    # model.fit(X_train, y_train)
    # print("Coefficient (Slope):", model.coef_[0])
    # print("Intercept:", model.intercept_)
    # # Do cross validation later

    # #predictions and test set evaluation
    # y_pred = model.predict(X_test)
    # predictions = pd.DataFrame({'Actual': y_test, 'Predicted': y_pred})
    # print(predictions)

    # mae = mean_absolute_error(y_test, y_pred)
    # mse = mean_squared_error(y_test, y_pred)
    # r2 = r2_score(y_test, y_pred)

    # print("Mean Absolute Error (MAE):", mae)
    # print("Mean Squared Error (MSE):", mse)
    # print("R-squared Score:", r2)





    # R^2: basic linear reg is -1, MLP is -24 BRUHHHHHH

    """
    R-squared Score: -0.6991570375221456
    """

if __name__ == "__main__":
    main()