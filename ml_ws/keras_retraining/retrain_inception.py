from keras.preprocessing.image import ImageDataGenerator
from keras.models import Sequential, Model
from keras.layers import Conv2D, GlobalMaxPooling2D, Activation, Dropout, Flatten, Dense, GlobalAveragePooling2D
from keras import backend as K
from keras import applications, optimizers
from keras.optimizers import SGD
from keras.utils.np_utils import to_categorical
import os, os.path
import numpy as np

img_width, img_height = 299, 299

train_data_dir = 'building_photos/train_20'
validation_data_dir = 'building_photos/train_20'
test_data_dir = 'building_photos/train_20'
class_counts = len(os.listdir(train_data_dir))
nb_train_samples = sum([len(files) for r, d, files in os.walk(train_data_dir)])
nb_validation_samples = sum([len(files) for r, d, files in os.walk(validation_data_dir)])
nb_test_samples = sum([len(files) for r, d, files in os.walk(test_data_dir)])
print("nb_train_samples: "+str(nb_train_samples))
print("nb_validation_samples: "+str(nb_validation_samples))
print("nb_test_samples: "+str(nb_test_samples))

epochs = 50
batch_size = 10

if K.image_data_format() == 'channels_first':
    input_shape = (3, img_width, img_height)
else:
    input_shape = (img_width, img_height, 3)

base_model = applications.InceptionV3(weights='imagenet', include_top=False)
# add a global spatial average pooling layer
x = base_model.output
x = GlobalMaxPooling2D()(x)
# let's add a fully-connected layer
x = Dense(1024, activation='relu')(x)
# and a logistic layer -- let's say we have 200 classes
predictions = Dense(class_counts, activation='softmax')(x)

# this is the augmentation configuration we will use for training
model = Model(inputs=base_model.input, outputs=predictions)

# first: train only the top layers (which were randomly initialized)
# i.e. freeze all convolutional InceptionV3 layers
# print("layer number "+ str(len(base_model.layers)))
# print(str(base_model.layers))
for layer in base_model.layers:
    layer.trainable = False

sgd=optimizers.SGD()
# compile the model (should be done *after* setting layers to non-trainable)
model.compile(optimizer=sgd, loss='categorical_crossentropy', metrics=['categorical_accuracy'])

datagen = ImageDataGenerator(rescale = 1. / 255)
validation_datagen = ImageDataGenerator(rescale=1. / 255)
predict_datagen = ImageDataGenerator(rescale=1. / 255)

train_generator = datagen.flow_from_directory(
    train_data_dir,
    target_size=(img_width, img_height),
    batch_size=batch_size,
    class_mode='categorical')
validation_generator = datagen.flow_from_directory(
    validation_data_dir,
    target_size=(img_width, img_height),
    batch_size=batch_size,
    class_mode='categorical')
# print("*********************validation_generator*********************")
# print(str(validation_generator.class_indices).encode('utf-8'))
# print(str(validation_generator.classes).encode('utf-8'))
# print("*********************vaidation_file_names*********************")
# print(validation_generator.filenames)

prediction_generator = predict_datagen.flow_from_directory(
    test_data_dir,
    target_size=(img_width, img_height),
    batch_size=1,
    shuffle=False)
test_filenames = prediction_generator.filenames

model.fit_generator(
    train_generator,
    steps_per_epoch=nb_train_samples // batch_size,
    epochs=epochs,
    validation_data=train_generator,
    validation_steps=nb_train_samples // batch_size
)

print("*********************prediction_class_indices*********************")
print(prediction_generator.class_indices)
print("*********************prediction_classes*********************")
print(prediction_generator.classes)
test_prediction = model.predict_generator(prediction_generator, verbose=1)
model.save_weights('inception_v3.h5')

correct_counts = 0
c=0
for r, d, files in sorted(os.walk(test_data_dir)):
    if(len(files)!=0):
        if c==0:
            test_labels = np.array([0]*len(files))
        else:
            test_labels = np.concatenate((test_labels, np.array([c]*len(files))))
        c+=1
test_labels = to_categorical(test_labels)

for index, i in enumerate(test_prediction):
    # if index >= len(test_filenames) or index >= len(test_labels):
    #     break
    print(" index: "+str(index)+"  "+str(str(test_filenames[index]).encode('utf-8'))+"perdiction: "+str(np.argmax(i))+" label: "+str(np.argmax(test_labels[index])))
    if np.argmax(i) == np.argmax(test_labels[index]):
        correct_counts+=1
        print("is corrected")
    else:
        # if index >= len(val_filenames):
            # break
        print("is wrong")

print("correct counts: "+str(correct_counts)+"  total: "+str(nb_test_samples))
print("final test accuracy: "+str(correct_counts/nb_test_samples))
