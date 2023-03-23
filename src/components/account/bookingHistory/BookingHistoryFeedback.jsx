import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import EZContainer from '../../core/EZContainer';
import EZText from '../../core/EZText';
import {
  dateFormatMomentWithoutSecond,
  formatRelativeTime,
} from '../../../shared/handleDate';
import {handleCurrenCy} from '../../../shared/handleCurrenCy';
import {LIMITSTAR} from '../../../utils/constants';

import EZInput from '../../core/EZInput';
import {EZButton, EZButtonText} from '../../core/EZButton';
import Icon from 'react-native-vector-icons/FontAwesome';
import useRQGlobalState from '../../../hooks/useRQGlobal';
import EZLoading from '../../core/EZLoading';
import {
  useCreateComment,
  useEditComment,
  useGetComment,
} from '../../../hooks/api/useComments';
import {bgDefault, COLORS, FONTSIZE, SPACING} from '../../../assets/styles/styles';

const BookingHistoryFeedBack = ({idParking}) => {
  const mutationCreateComment = useCreateComment();
  const mutationEditComment = useEditComment();
  const mutationGetComment = useGetComment();
  const [userInfo] = useRQGlobalState('user', {});
  const {BG} = bgDefault();
  const [action, setAction] = useState('');
  const [params, setParams] = useState({
    rating: 0,
    content: null,
  });
  const [errMess, setErrMess] = useState({
    rating: '',
    content: '',
  });
  const [starRating, setStarRating] = useState(
    [...Array(LIMITSTAR)].map(() => 'star-o'),
  );
  useEffect(() => {
    mutationGetComment.mutate({
      idUser: userInfo.id,
      idParkingLot: idParking,
    });
  }, []);
  useEffect(() => {
    if (mutationGetComment.isSuccess && mutationGetComment.data.length == 0) {
      setAction('create');
      setParams({
        rating: 0,
        content: null,
      });
    } else if (
      mutationGetComment.isSuccess &&
      mutationGetComment.data.length > 0
    ) {
      setAction('review');
      setParams({
        ...params,
        ['content']: mutationGetComment.data[0].content,
      });
      handlePressRating(mutationGetComment.data[0].ranting);
    }
  }, [mutationGetComment.status]);
  useEffect(() => {
    const checkCallApi = () => {
      if (mutationCreateComment.isSuccess) {
        mutationGetComment.mutate({
          idUser: userInfo.id,
          idParkingLot: idParking,
        });
      }

      if (mutationEditComment.isSuccess) {
        mutationGetComment.mutate({
          idUser: userInfo.id,
          idParkingLot: idParking,
        });
      }
    };
    checkCallApi();
  }, [mutationCreateComment.status, mutationEditComment.status]);

  const handlePressRating = number => {
    let arrStar = [...Array(number + 1)].map(() => 'star');
    [...Array(LIMITSTAR - number + 1)].forEach(() => {
      arrStar.push('star-o');
    });
    setStarRating(arrStar);
    setParams({...params, ['rating']: number + 1});
  };
  const handleEdit = () => {
    if (!validate()) {
      return;
    }
    mutationEditComment.mutate({
      content: params.content,
      ranting: params.rating,
      id: mutationGetComment.data[0].idComment,
    });
  };
  const handleCreate = () => {
    if (!validate()) {
      return;
    }
    mutationCreateComment.mutate({
      userId: userInfo.id,
      parkingId: idParking,
      content: params.content,
      ranting: params.rating,
    });
  };
  const validate = () => {
    let check = true;
    let errMess = {
      rating: '',
      content: '',
    };
    if (params.rating < 1 || params.rating > 5) {
      check = false;
      errMess.rating = 'Please rate star!';
    }
    setErrMess(errMess);
    return check;
  };

  return (
    <EZContainer>
      {mutationGetComment.isLoading && <EZLoading />}
      <EZText
        styleEZText={{
          backgroundColor: BG,
          paddingVertical: 15,
          width: '100%',
          textAlign: 'center',
          borderBottomWidth: 0.3,
          borderBottomColor: COLORS.borderInput,
        }}
        bold
        size="quiteLarge">
        Your review
      </EZText>
      {action === 'review' &&
        mutationGetComment.isSuccess &&
        mutationGetComment.data?.length > 0 && (
          <View style={styles.containerFeedback}>
            <View style={styles.flexRowStartFlex}>
              <Image
                source={{uri: mutationGetComment.data[0]?.avatar}}
                style={styles.avatar}
              />
              <EZText bold>{mutationGetComment.data[0]?.fullName}</EZText>
            </View>
            <View style={styles.contentRight}>
              <View style={styles.flexRow}>
                <View style={styles.rating}>
                  {[...Array(params.rating)].map((val, index) => (
                    <Icon
                      name="star"
                      size={FONTSIZE.iconMedium}
                      color={COLORS.yellow}
                      key={index}
                    />
                  ))}
                  {[
                    ...Array(LIMITSTAR - mutationGetComment.data[0].ranting),
                  ].map((val, index) => (
                    <Icon
                      name="star-o"
                      size={FONTSIZE.iconMedium}
                      color={COLORS.borderInput}
                      key={index}
                    />
                  ))}
                </View>
                <EZText color={COLORS.disable} size="small">
                  {formatRelativeTime(mutationGetComment.data[0]?.created_at)}
                </EZText>
              </View>
              <EZText textAlign="justify">
                {mutationGetComment.data[0]?.content === ''
                  ? "You didn't write anything"
                  : mutationGetComment.data[0]?.content}
              </EZText>
              <EZButtonText
                text="Edit"
                color={COLORS.primary}
                handlePress={() => setAction('edit')}
              />
            </View>
          </View>
        )}
      {(action === 'edit' || action === 'create') && (
        <View style={styles.form}>
          <View style={styles.stars}>
            {[...Array(LIMITSTAR)].map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handlePressRating(index)}>
                <Icon
                  name={starRating[index]}
                  size={FONTSIZE.iconHuge}
                  color={
                    starRating[index] === 'star'
                      ? COLORS.yellow
                      : COLORS.disable
                  }
                />
              </TouchableOpacity>
            ))}
          </View>
          {errMess.rating && (
            <EZText color={COLORS.redLight} size="small">
              {errMess.rating}
            </EZText>
          )}
          <EZInput
            label="Write you review"
            errMess={errMess.content}
            styleEZInput={{marginVertical: SPACING.mbInputItem}}
            lines={5}
            placeholder="How do you feel?"
            defaultValue={params.content}
            onChangeText={newText =>
              setParams({...params, ['content']: newText})
            }
          />
          <View style={styles.flexRow}>
            <EZButton
              title={action === 'edit' ? 'Edit review' : 'Post review'}
              handlePress={action === 'edit' ? handleEdit : handleCreate}
              w={action === 'edit' ? '40%' : '100%'}
            />
            {action === 'edit' && (
              <EZButton
                title={'Cancel edit'}
                handlePress={() => setAction('review')}
                w="40%"
                type="secondary"
              />
            )}
          </View>
        </View>
      )}
    </EZContainer>
  );
};

export default BookingHistoryFeedBack;

const styles = StyleSheet.create({
  content: {
    width: '100%',
    borderRadius: 15,
    paddingHorizontal: SPACING.pxComponent,
    paddingBottom: 15,
    paddingTop: SPACING.pxComponent,
    gap: 10,
  },
  stars: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  form: {
    paddingHorizontal: SPACING.pxComponent,
    marginVertical: 20,
  },
  containerFeedback: {
    padding: SPACING.pxComponent,
    borderRadius: 6,
    marginBottom: 15,
    gap: 8,
  },
  flexRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    gap: 10,
  },
  flexRowStartFlex: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 40,
    borderColor: COLORS.tertiary,
    borderWidth: 2,
  },
  contentRight: {
    width: '100%',
  },
  rating: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: SPACING.mbInputItem,
  },
});
