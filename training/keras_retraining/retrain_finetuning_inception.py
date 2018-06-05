from keras.preprocessing.image import ImageDataGenerator
from keras.models import Sequential, Model
from keras.layers import Conv2D, Input, GlobalMaxPooling2D, Activation, Dropout, Flatten, Dense, GlobalAveragePooling2D
from keras import backend as K
from keras import applications, optimizers
from keras.optimizers import SGD
from keras.utils.np_utils import to_categorical
import os, os.path, pickle
import numpy as np

img_width, img_height = 299, 299

model_dir = '../keras_model/inception_v3.h5'
train_data_dir = 'building_photos/train'
validation_data_dir = 'building_photos/validation'
test_data_dir = 'building_photos/test'
class_counts = len(os.listdir(train_data_dir))
nb_train_samples = sum([len(files) for r, d, files in os.walk(train_data_dir)])
nb_validation_samples = sum([len(files) for r, d, files in os.walk(validation_data_dir)])
nb_test_samples = sum([len(files) for r, d, files in os.walk(test_data_dir)])
print("nb_train_samples: "+str(nb_train_samples))
print("nb_validation_samples: "+str(nb_validation_samples))
print("nb_test_samples: "+str(nb_test_samples))

epochs = 3
batch_size = 50


input_tensor = Input(shape=(299,299,3))
base_model = applications.InceptionV3(weights='imagenet', include_top=False, input_tensor=input_tensor)
for layer in base_model.layers:
    layer.trainable = False


top_model = Sequential()
top_model.add(Flatten(input_shape=base_model.output_shape[1:]))
top_model.add(Dense(256, activation='relu'))
top_model.add(Dense(class_counts, activation='softmax'))
model = Model(input= base_model.input, output= top_model(base_model.output))

opt=optimizers.SGD()
# compile the model (should be done *after* setting layers to non-trainable)
model.compile(optimizer=opt, loss='categorical_crossentropy', metrics=['categorical_accuracy'])

train_datagen = ImageDataGenerator(rescale=1./255)

# Data Augumation
# train_datagen = ImageDataGenerator(
#         rescale=1./255,
#         shear_range=0.2,
#         zoom_range=0.2,
#         horizontal_flip=True)
validation_datagen = ImageDataGenerator(rescale=1. / 255)
predict_datagen = ImageDataGenerator(rescale=1. / 255)

train_generator = train_datagen.flow_from_directory(
    train_data_dir,
    target_size=(img_width, img_height),
    batch_size=batch_size,
    class_mode='categorical')
train_filenames = train_generator.filenames
validation_generator = validation_datagen.flow_from_directory(
    validation_data_dir,
    target_size=(img_width, img_height),
    batch_size=batch_size,
    class_mode='categorical',
    shuffle=False)
class_dict = {v: k for k, v in train_generator.class_indices.items()}
with open('../keras_model/class_dict.pkl', 'wb') as f:
    pickle.dump(class_dict, f, pickle.HIGHEST_PROTOCOL)
print("saved class_indices")

validation_filenames = validation_generator.filenames

# print("*********************validation_generator*********************")
# print(str(validation_generator.class_indices).encode('utf-8'))
# print(str(validation_generator.classes).encode('utf-8'))
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
    validation_data=validation_generator,
    validation_steps=nb_validation_samples // batch_size
)



# print("**************fine tuning******************************")
# for layer in model.layers[:249]:
#    layer.trainable = False
# for layer in model.layers[249:]:
#    layer.trainable = True
# model.compile(optimizer=SGD(lr=0.0001, momentum=0.9), loss='categorical_crossentropy', metrics=['categorical_accuracy'])
# model.fit_generator(
#     train_generator,
#     steps_per_epoch=nb_train_samples // batch_size,
#     epochs=epochs,
#     validation_data=validation_generator,
#     validation_steps=nb_validation_samples // batch_size
# )

model.save(model_dir)

def evaluation(mode):
    if mode == 'validation':
        data_dir = validation_data_dir
        filenames = validation_filenames
        nb = nb_validation_samples
        generator = validation_generator
    else:
        data_dir = test_data_dir
        filenames = test_filenames
        nb = nb_test_samples
        generator = prediction_generator
    prediction = model.predict_generator(generator, verbose=1)
    correct_counts = 0
    c=0
    for r, d, files in sorted(os.walk(data_dir)):
        if(len(files)!=0):
            if c==0:
                labels = np.array([0]*len(files))
            else:
                labels = np.concatenate((labels, np.array([c]*len(files))))
            c+=1
    labels = to_categorical(labels)
    for index, i in enumerate(prediction):
        # print("index: "+str(index)+"  "+str(str(filenames[index]).encode('utf-8'))+"perdiction: "+class_dict[np.argmax(i)]+ "   label: "+class_dict[np.argmax(labels[index])])
        if np.argmax(i) == np.argmax(labels[index]):
            correct_counts+=1
        else:
            print("wrong index: "+str(index)+"  "+str(str(filenames[index]).encode('utf-8'))+"perdiction: "+class_dict[np.argmax(i)]+ "   label: "+class_dict[np.argmax(labels[index])])
    print("correct counts: "+str(correct_counts)+"  total: "+str(nb))
    print("final " + mode + "accuracy: "+str(correct_counts/nb))
evaluation('validation')
evaluation('test')






# print("*********************prediction_classes*********************")
# print(prediction_generator.classes)
# test_prediction = model.predict_generator(prediction_generator, verbose=1)
#
#
# correct_counts = 0
# c=0
# for r, d, files in sorted(os.walk(test_data_dir)):
#     if(len(files)!=0):
#         if c==0:
#             test_labels = np.array([0]*len(files))
#         else:
#             test_labels = np.concatenate((test_labels, np.array([c]*len(files))))
#         c+=1
# test_labels = to_categorical(test_labels)
#
# for index, i in enumerate(test_prediction):
#     # if index >= len(test_filenames) or index >= len(test_labels):
#     #     break
#
#     if np.argmax(i) == np.argmax(test_labels[index]):
#         correct_counts+=1
#         # print("is corrected")
#     else:
#         # if index >= len(val_filenames):
#             # break
#         print(" index: "+str(index)+"  "+str(str(test_filenames[index]).encode('utf-8'))+"perdiction: "+str(np.argmax(i))+" label: "+str(np.argmax(test_labels[index])))
#         print("is wrong")
#
# print("correct counts: "+str(correct_counts)+"  total: "+str(nb_test_samples))
# print("final test accuracy: "+str(correct_counts/nb_test_samples))
