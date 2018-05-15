from keras.preprocessing.image import ImageDataGenerator
from keras.models import Sequential, Model
from keras.layers import Conv2D, MaxPooling2D, Activation, Dropout, Flatten, Dense, GlobalAveragePooling2D
from keras import backend as K
from keras import applications
import os, os.path
import numpy as np

img_width, img_height = 299, 299

train_data_dir = 'building_photos/train'
validation_data_dir = 'building_photos/validation'
test_data_dir = 'building_photos/test'
nb_train_samples = sum([len(files) for r, d, files in os.walk("./building_photos/train")])
nb_validation_samples = sum([len(files) for r, d, files in os.walk("./building_photos/validation")])
nb_test_samples = sum([len(files) for r, d, files in os.walk("./building_photos/test")])
print("nb_train_samples: "+str(nb_train_samples))
print("nb_validation_samples: "+str(nb_validation_samples))
print("nb_test_samples: "+str(nb_test_samples))


epochs = 5
batch_size = 10

if K.image_data_format() == 'channels_first':
    input_shape = (3, img_width, img_height)
else:
    input_shape = (img_width, img_height, 3)

base_model = applications.InceptionV3(weights='imagenet', include_top=False)
# add a global spatial average pooling layer
x = base_model.output
x = GlobalAveragePooling2D()(x)
# let's add a fully-connected layer
x = Dense(1024, activation='relu')(x)
# and a logistic layer -- let's say we have 200 classes
predictions = Dense(3, activation='softmax')(x)

# this is the augmentation configuration we will use for training
model = Model(inputs=base_model.input, outputs=predictions)

# first: train only the top layers (which were randomly initialized)
# i.e. freeze all convolutional InceptionV3 layers
for layer in base_model.layers:
    layer.trainable = False

# compile the model (should be done *after* setting layers to non-trainable)
model.compile(optimizer='rmsprop', loss='categorical_crossentropy', metrics=['accuracy'])

train_datagen = ImageDataGenerator(
    rescale=1. / 255)

# this is the augmentation configuration we will use for testing:
# only rescaling
test_datagen = ImageDataGenerator(rescale=1. / 255)
predict_datagen = ImageDataGenerator()

train_generator = train_datagen.flow_from_directory(
    train_data_dir,
    target_size=(img_width, img_height),
    batch_size=batch_size)

validation_generator = test_datagen.flow_from_directory(
    validation_data_dir,
    target_size=(img_width, img_height),
    batch_size=batch_size)
print("*********************vaidation_file_names*********************")
print(validation_generator.filenames)

prediction_generator = predict_datagen.flow_from_directory(
    test_data_dir,
    target_size=(img_width, img_height),
    batch_size=batch_size,
    shuffle=False)

model.fit_generator(
    train_generator,
    steps_per_epoch=nb_train_samples // batch_size,
    epochs=epochs,
    validation_data=validation_generator,
    validation_steps=nb_validation_samples // batch_size)
model.save_weights('inception_v3.h5')


print("*********************prediction_file_names*********************")
print(prediction_generator.filenames)
print("*********************prediction_class_indices*********************")
print(prediction_generator.class_indices)
print("*********************prediction_classes*********************")
print(prediction_generator.classes)
prediction = model.predict_generator(prediction_generator, verbose=1)
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
