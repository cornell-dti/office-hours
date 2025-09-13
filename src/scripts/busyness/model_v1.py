import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

#question might actually not matter at all. we need inputs that matter for the whole session, not an individual question
#what the frontend will call: at [session start time to end time] on [day of week] for [course], what is the estimated wait time? 
# could add extra things like tags, number of TAs. things you know BEFORE a session starts.
# x = [startHour, startMin, endHour, endMin, courseName, month, dayOfWeek]
# y = [wait time] (this is a supervised learning problem. use the waitTimeBeforeAssignment col in the df )
# maybe have a thing where if the prediction date is too far off we just do a uniform distribution cause what's the point in calling the model

def load_data(file_path):
    """Load and preprocess data from CSV file"""
    df = pd.read_csv(file_path)
    
    #There shouldn't really be missing values, but just in case we can drop.
    df.dropna(inplace=True)  # Remove rows with missing values
    df['date'] = pd.to_datetime(df['date'])
    df['startTime'] = pd.to_datetime(df['startTime'])
    df['endTime'] = pd.to_datetime(df['endTime'])
    df['timeAssigned'] = pd.to_timedelta(df['timeAssigned'])
    df['timeEntered'] = pd.to_timedelta(df['timeEntered'])
    df['month'] = df['date'].dt.month
    df['day'] = df['date'].dt.dayofweek
    df['startHour'] = df['startTime'].dt.hour
    df['startMin'] = df['startTime'].dt.minute
    df['endHour'] = df['endTime'].dt.hour
    df['endMin'] = df['endTime'].dt.minute
    df['timeAssigned'] = df['timeAssigned'].dt.total_seconds()
    df['timeEntered'] = df['timeEntered'].dt.total_seconds()
    
    df['timeWaiting'] = df['timeAssigned'] - df['timeEntered']
    #later add code that guards against weird negative values - just set those to 0.1 or something
 
    df = df.drop(columns=['date', 'answererId', 'askerId', 'content', 'location', 'position', 'primaryTag', 'secondaryTag', 'wasNotified', 'status', 'startTime', 'endTime'])
    df = df.sort_values('timeEntered')
    print(df)
    print(len(df))
    print("-----------------")

    return df


def main():
    """Run the vanilla LSTM pipeline"""
    # Load data
    df = load_data('dummy_data.csv')

    # Check if we have enough data
    if len(df) < 10:
        print("Not enough data to create sequences.")
        return
    #return a uniform prediction here


    #split train/test so past is always used to predict future. 
    # test data needs to be unique?? bc what if i have same sessions but two different questions with different wait times - the "truth" would be the average right?
    # or maybe it doesn't matter? whatever estimate minimizes the mean squared error <- going with this for now
    
    X = df[['month', 'day', 'startHour', 'startMin', 'endHour', 'endMin']]
    y = df['timeWaiting']  

    X_train, X_test, y_train, y_test = train_test_split(X,y, test_size=0.2, shuffle=False)
    print(f"after split, X_train: {len(X_train)}, X_test: {len(X_test)}, y_train: {len(y_train)}, y_test:{len(y_test)}")


    # normalizing probably doesn't make sense (you cant normalize a month)
    model = LinearRegression()
    model.fit(X_train, y_train)
    print("Coefficient (Slope):", model.coef_[0])
    print("Intercept:", model.intercept_)
    # Do cross validation later

    #predictions and test set evaluation
    y_pred = model.predict(X_test)
    predictions = pd.DataFrame({'Actual': y_test, 'Predicted': y_pred})
    print(predictions)

    mae = mean_absolute_error(y_test, y_pred)
    mse = mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)

    print("Mean Absolute Error (MAE):", mae)
    print("Mean Squared Error (MSE):", mse)
    print("R-squared Score:", r2)


    """
    Mean Absolute Error (MAE): 81.38613601574457
Mean Squared Error (MSE): 12416.423261734735
R-squared Score: -0.6672606163034074
    
    """

if __name__ == "__main__":
    main()