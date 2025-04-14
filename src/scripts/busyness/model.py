import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
from sklearn.feature_extraction.text import CountVectorizer
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from tensorflow.keras.callbacks import EarlyStopping

def load_data(file_path):
    """Load and preprocess data from CSV file"""
    df = pd.read_csv(file_path)
    
    # Convert time columns from HH:MM:SS to seconds
    time_columns = ['waitTimeBeforeAssignment', 'responseTimeAfterAssignment', 'totalDuration']
    for col in time_columns:
         # This checks whether the column includes data types like strings
        if col in df.columns and df[col].dtype == 'object':
            # Convert the time strings to a timedelta object
#           # https://pandas.pydata.org/docs/reference/api/pandas.to_timedelta.html
            df[col] = pd.to_timedelta(df[col])
            # Convert the timedelta object to seconds
            df[col] = df[col].dt.total_seconds()
    
    # For now, the dummy data csv has a 'content' column with text representing question contents.
    # We will apply length functions and lambda functions to extract features like the len of the question
    # and the word count
    df['question_length'] = df['content'].apply(len)
    df['word_count'] = df['content'].apply(lambda x: len(str(x).split()))
    
    # Use bag of words representations for the text data
    # CountVectorizer is a good text preprocessing technique for converting text into numeric vectors
    # https://scikit-learn.org/stable/modules/generated/sklearn.feature_extraction.text.CountVectorizer.html
    vectorizer = CountVectorizer(max_features=20, stop_words='english')
    # Fit the vectorizer to the data and then transform the data into a vectorized format
    bag_of_word_features = vectorizer.fit_transform(df['content']).toarray()
    
    # Get output feature names after transformation
    feature_names = vectorizer.get_feature_names_out()
    bag_of_word_df = pd.DataFrame(bag_of_word_features, columns=feature_names)
    
    # Combine with original dataframe, concatenate along the columns
    df = pd.concat([df, bag_of_word_df], axis=1)
    
    # Drop the original text content and ID because we already processed the keywords of the question contents
    numeric_df = df.drop(columns=['questionId', 'content'])
    
    # Print the vocabulary we're using
    print(f"Using {len(feature_names)} words from vocabulary:")
    print(feature_names)
    
    # Sort by wait time
    numeric_df = numeric_df.sort_values('waitTimeBeforeAssignment')
    
    return numeric_df


def main():
    """Run the vanilla LSTM pipeline"""
    # Load data
    data = load_data('dummy_data.csv')
    
    # Check if we have enough data
    if len(data) < 10:
        print("Not enough data to create sequences.")
        return

if __name__ == "__main__":
    main()