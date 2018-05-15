import numpy as np
from keras.preprocessing.image import ImageDataGenerator
from keras.models import Sequential
from keras.layers import Dropout, Flatten, Dense, Activation
from keras.utils.np_utils import to_categorical
from keras import applications
import os, os.path

# dimensions of our images.
img_width, img_height = 150, 150

top_model_weights_path = 'bottleneck_fc_model.h5'
train_data_dir = 'building_photos/train'
validation_data_dir = 'building_photos/validation'
test_data_dir = 'building_photos/test'
train_data_dir = 'building_photos/train'
validation_data_dir = 'building_photos/validation'
test_data_dir = 'building_photos/test'
nb_train_samples = sum([len(files) for r, d, files in os.walk("./building_photos/train")])
nb_validation_samples = sum([len(files) for r, d, files in os.walk("./building_photos/validation")])
nb_test_samples = sum([len(files) for r, d, files in os.walk("./building_photos/test")])
print("nb_train_samples: "+str(nb_train_samples))
print("nb_validation_samples: "+str(nb_validation_samples))
print("nb_test_samples: "+str(nb_test_samples))

epochs = 20
batch_size = 5


def save_bottlebeck_features():
    datagen = ImageDataGenerator(rescale=1. / 255)

    # build the VGG16 network
    model = applications.VGG16(include_top=False, weights='imagenet')

    generator = datagen.flow_from_directory(
        train_data_dir,
        target_size=(img_width, img_height),
        batch_size=batch_size,
        class_mode=None,
        shuffle=False)
    bottleneck_features_train = model.predict_generator(
        generator, nb_train_samples // batch_size)
    np.save('bottleneck_features_train.npy',
            bottleneck_features_train)

    generator = datagen.flow_from_directory(
        validation_data_dir,
        target_size=(img_width, img_height),
        batch_size=batch_size,
        class_mode=None,
        shuffle=False)
    bottleneck_features_validation = model.predict_generator(
        generator, nb_validation_samples // batch_size)
    np.save('bottleneck_features_validation.npy',
            bottleneck_features_validation)

    generator = datagen.flow_from_directory(
        test_data_dir,
        target_size=(img_width, img_height),
        batch_size=batch_size,
        class_mode=None,
        shuffle=False)
    bottleneck_features_test = model.predict_generator(
        generator, nb_test_samples // batch_size)
    np.save('bottleneck_features_test.npy',
            bottleneck_features_test)


def train_top_model():
    train_data = np.load('bottleneck_features_train.npy')
    train_labels = np.array([0] * (nb_train_samples // 3) + [1] * (nb_train_samples // 3) + [2] * (nb_train_samples // 3))
    train_labels = to_categorical(train_labels)

    validation_data = np.load('bottleneck_features_validation.npy')
    validation_labels = np.array([0] * (nb_validation_samples // 3) + [1] * (nb_validation_samples // 3) + [2] * (nb_validation_samples // 3))
    validation_labels = to_categorical(validation_labels)

    test_data = np.load('bottleneck_features_test.npy')
    test_labels = np.array([0] * (nb_test_samples // 3) + [1] * (nb_test_samples // 3) + [2] * (nb_test_samples // 3))
    test_labels = to_categorical(test_labels)
    print("************train_data shape***************************")
    print(train_data.shape)
    print(train_data.shape[1:])

    model = Sequential()
    model.add(Flatten(input_shape=train_data.shape[1:]))
    model.add(Dense(256))
    model.add(Activation('relu'))
    model.add(Dense(3))
    model.add(Activation('softmax'))

    model.compile(optimizer='rmsprop',
                  loss='categorical_crossentropy', metrics=['accuracy'])

    model.fit(train_data, train_labels,
              epochs=epochs,
              batch_size=batch_size,
              validation_data=(validation_data, validation_labels))
    model.save_weights(top_model_weights_path)
    prediction = model.predict(test_data, verbose=1)

    print("*****************test lebels******************")
    print(test_labels[0:10])
    print(test_labels[10:20])
    print(test_labels[20:30])

    print("*********************prediction*********************")
    print(prediction)
    correct_counts = 0
    for index, i in enumerate(prediction):
        class_index = index//10
        if np.argmax(i)==class_index:
            correct_counts+=1
            print("class: "+str(class_index)+" index: "+str(index)+": is corrected")
        else:
            print("class: "+str(class_index)+" index: "+str(index)+": is wrong")
    print("correct counts: "+str(correct_counts)+"  total: "+str(nb_test_samples))
    print("final test accuracy: "+str(correct_counts/nb_test_samples))

save_bottlebeck_features()
train_top_model()
