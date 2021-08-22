import ListItem from '../../list/utils/listItemModel';
import ListType from '../../list/utils/listTypeModel';

export const getTags = async (body) => {
  let postBody = body;
  postBody = postBody.split('^^__');
  let tags: any = [];
  postBody.forEach((m) => {
    if (m.includes('@@@__')) {
      const tag = m.split('@@@__').pop();
      tags.push(tag);
    }
  });
  if (tags.length > 0) {
    let typeTags: any = [];
    typeTags = await ListType.find({
      _id: {
        $in: tags,
      },
    });
    typeTags = typeTags.map((l) => ({ tag: l._id, tagModel: 'ListType' }));
    let itemTags: any = [];
    itemTags = await ListItem.find({
      _id: {
        $in: tags,
      },
    });
    itemTags = itemTags.map((l) => ({ tag: l._id, tagModel: 'ListItem' }));
    tags = [...typeTags, ...itemTags];
  }
  // console.log('tags', tags);
  return tags;
};
